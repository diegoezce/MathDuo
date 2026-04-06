import { Router } from "express";
import { db, userProgressTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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

router.get("/", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const progress = await db.select().from(userProgressTable).where(eq(userProgressTable.userId, userId));
    return res.json(progress.map(p => ({
      lessonId: p.lessonId,
      status: p.status,
      bestAccuracy: p.bestAccuracy ?? null,
      timesCompleted: p.timesCompleted,
      lastCompletedAt: p.lastCompletedAt?.toISOString() ?? null,
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/streak", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "not_found" });

    return res.json({
      currentStreak: user.streakDays,
      maxStreak: user.maxStreak,
      lastActivityDate: user.lastActivityDate || null,
      streakFreezeAvailable: user.streakFreezeAvailable,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
