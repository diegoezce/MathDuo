import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db, usersTable, lessonsTable, userProgressTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.SESSION_SECRET || "mathduo-secret-2024";

function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

function getCallbackUrl(): string {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domain) return `https://${domain}/api/auth/google/callback`;
  return "http://localhost:80/api/auth/google/callback";
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: getCallbackUrl(),
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email from Google"), false as any);

        // Check if user exists by googleId or email
        const [existingByGoogle] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.googleId, profile.id))
          .limit(1);

        if (existingByGoogle) {
          // Update avatar if changed
          const avatarUrl = profile.photos?.[0]?.value ?? existingByGoogle.avatarUrl;
          await db
            .update(usersTable)
            .set({ avatarUrl })
            .where(eq(usersTable.id, existingByGoogle.id));
          return done(null, existingByGoogle);
        }

        // Check if email already registered (link accounts)
        const [existingByEmail] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        if (existingByEmail) {
          await db
            .update(usersTable)
            .set({
              googleId: profile.id,
              avatarUrl: profile.photos?.[0]?.value ?? existingByEmail.avatarUrl,
            })
            .where(eq(usersTable.id, existingByEmail.id));
          return done(null, existingByEmail);
        }

        // Create new user
        const displayName = profile.displayName || profile.name?.givenName || "Learner";
        const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
        // Ensure username uniqueness
        let username = baseUsername;
        let suffix = 1;
        while (true) {
          const [taken] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
          if (!taken) break;
          username = `${baseUsername}${suffix++}`;
        }

        const [newUser] = await db
          .insert(usersTable)
          .values({
            username,
            email,
            googleId: profile.id,
            displayName,
            avatarUrl: profile.photos?.[0]?.value ?? null,
            xp: 0,
            level: 1,
            lives: 5,
            streakDays: 0,
          })
          .returning();

        // Initialize progress for all lessons
        const lessons = await db.select().from(lessonsTable).orderBy(lessonsTable.orderIndex);
        if (lessons.length > 0) {
          const firstLesson = lessons[0];
          for (const lesson of lessons) {
            await db.insert(userProgressTable).values({
              userId: newUser.id,
              lessonId: lesson.id,
              status: lesson.id === firstLesson.id ? "available" : "locked",
              timesCompleted: 0,
            }).onConflictDoNothing();
          }
        }

        return done(null, newUser);
      } catch (err) {
        return done(err as Error, false as any);
      }
    }
  )
);

// Initiate Google OAuth flow
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Google callback — issue JWT and redirect to frontend
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/?google_error=1" }),
  (req, res) => {
    const user = req.user as any;
    if (!user) return res.redirect("/?google_error=1");

    const token = generateToken(user.id);
    // Redirect to frontend with token in query param; frontend reads it once and stores in localStorage
    res.redirect(`/?google_token=${encodeURIComponent(token)}`);
  }
);

export default router;
