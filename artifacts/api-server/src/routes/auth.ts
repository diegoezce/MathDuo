import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterUserBody, LoginUserBody } from "@workspace/api-zod";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.SESSION_SECRET || "mathduo-secret-2024";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "mathduo_salt").digest("hex");
}

function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    return null;
  }
}

function userToResponse(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName || user.username,
    avatarUrl: user.avatarUrl || null,
    xp: user.xp,
    level: user.level,
    lives: user.lives,
    streakDays: user.streakDays,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/register", async (req, res) => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: "Invalid request body" });
  }
  const { username, email, password, displayName } = parsed.data;

  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: "email_taken", message: "Email already in use" });
    }
    const existingUsername = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existingUsername.length > 0) {
      return res.status(400).json({ error: "username_taken", message: "Username already taken" });
    }

    const [user] = await db.insert(usersTable).values({
      username,
      email,
      passwordHash: hashPassword(password),
      displayName: displayName || username,
      xp: 0,
      level: 1,
      lives: 5,
      streakDays: 0,
    }).returning();

    // Initialize progress for all available lessons (first lesson unlocked)
    const { lessonsTable, userProgressTable } = await import("@workspace/db");
    const lessons = await db.select().from(lessonsTable).orderBy(lessonsTable.orderIndex);
    if (lessons.length > 0) {
      const firstLesson = lessons[0];
      for (const lesson of lessons) {
        const status = lesson.id === firstLesson.id ? "available" : "locked";
        await db.insert(userProgressTable).values({
          userId: user.id,
          lessonId: lesson.id,
          status,
          timesCompleted: 0,
        }).onConflictDoNothing();
      }
    }

    const token = generateToken(user.id);
    return res.status(201).json({ user: userToResponse(user), token });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "server_error", message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: "Invalid request body" });
  }
  const { email, password } = parsed.data;

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
    }

    const token = generateToken(user.id);
    return res.json({ user: userToResponse(user), token });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "server_error", message: "Login failed" });
  }
});

router.post("/logout", (_req, res) => {
  return res.json({ success: true, message: "Logged out" });
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "unauthorized", message: "Invalid token" });
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "unauthorized", message: "User not found" });
    }
    return res.json(userToResponse(user));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "server_error", message: "Failed to get user" });
  }
});

export default router;
