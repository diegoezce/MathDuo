import { Router } from "express";
import { db, usersTable, achievementsTable, userAchievementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "./auth";

const router = Router();

function requireAuth(req: any, res: any): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized" });
    return null;
  }
  const payload = verifyToken(authHeader.slice(7));
  if (!payload) {
    res.status(401).json({ error: "unauthorized" });
    return null;
  }
  return payload.userId;
}

router.get("/leaderboard", async (_req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.xp)).limit(20);
    return res.json(users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      username: u.username,
      displayName: u.displayName || u.username,
      xp: u.xp,
      level: u.level,
      streakDays: u.streakDays,
    })));
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/achievements", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const allAchievements = await db.select().from(achievementsTable);
    const userUnlocked = await db.select().from(userAchievementsTable).where(eq(userAchievementsTable.userId, userId));
    const unlockedMap = new Map(userUnlocked.map(u => [u.achievementId, u.unlockedAt]));

    return res.json(allAchievements.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      iconEmoji: a.iconEmoji,
      unlocked: unlockedMap.has(a.id),
      unlockedAt: unlockedMap.get(a.id)?.toISOString() ?? null,
      requirement: a.requirement,
    })));
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
