import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyToken } from "./auth";

const router = Router();

function requireAuth(req: any, res: any): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const payload = verifyToken(authHeader.slice(7));
  return payload?.userId ?? null;
}

router.get("/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "invalid_id" });

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "not_found" });

    return res.json({
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
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/:userId/stats", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "invalid_id" });

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "not_found" });

    const { userProgressTable } = await import("@workspace/db");
    const progressRows = await db.select().from(userProgressTable).where(eq(userProgressTable.userId, userId));
    const lessonsCompleted = progressRows.filter(p => p.status === "completed" || p.status === "mastered").length;
    const accuracy = user.totalAnswers > 0 ? user.correctAnswers / user.totalAnswers : 0;

    return res.json({
      totalXp: user.xp,
      level: user.level,
      streakDays: user.streakDays,
      lessonsCompleted,
      accuracy,
      totalAnswers: user.totalAnswers,
      correctAnswers: user.correctAnswers,
      lives: user.lives,
      maxStreak: user.maxStreak,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
