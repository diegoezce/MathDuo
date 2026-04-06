import { Router } from "express";
import { db, lessonsTable, exercisesTable, userProgressTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { verifyToken } from "./auth";
import crypto from "crypto";

const router = Router();

const sessions = new Map<string, {
  userId: number;
  lessonId: number;
  exercises: any[];
  answers: { exerciseId: number; correct: boolean }[];
  startedAt: Date;
}>();

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

function lessonToResponse(lesson: any) {
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    category: lesson.category,
    difficulty: lesson.difficulty,
    xpReward: lesson.xpReward,
    orderIndex: lesson.orderIndex,
    requiredLessonIds: JSON.parse(lesson.requiredLessonIds || "[]"),
    iconEmoji: lesson.iconEmoji,
    color: lesson.color,
  };
}

function exerciseToResponse(ex: any, includeAnswer = false) {
  return {
    id: ex.id,
    lessonId: ex.lessonId,
    type: ex.type,
    question: ex.question,
    options: ex.options ? JSON.parse(ex.options) : null,
    correctAnswer: includeAnswer ? ex.correctAnswer : undefined,
    hint: ex.hint || null,
    orderIndex: ex.orderIndex,
  };
}

router.get("/", async (_req, res) => {
  try {
    const lessons = await db.select().from(lessonsTable).orderBy(lessonsTable.orderIndex);
    return res.json(lessons.map(lessonToResponse));
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/:lessonId", async (req, res) => {
  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) return res.status(400).json({ error: "invalid_id" });

  try {
    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId)).limit(1);
    if (!lesson) return res.status(404).json({ error: "not_found" });

    const exercises = await db.select().from(exercisesTable).where(eq(exercisesTable.lessonId, lessonId)).orderBy(exercisesTable.orderIndex);

    return res.json({
      ...lessonToResponse(lesson),
      exercises: exercises.map(e => exerciseToResponse(e)),
    });
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/:lessonId/start", async (req, res) => {
  const lessonId = parseInt(req.params.lessonId);
  const userId = requireAuth(req, res);
  if (!userId) return;
  if (isNaN(lessonId)) return res.status(400).json({ error: "invalid_id" });

  try {
    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId)).limit(1);
    if (!lesson) return res.status(404).json({ error: "not_found" });

    const exercises = await db.select().from(exercisesTable).where(eq(exercisesTable.lessonId, lessonId)).orderBy(exercisesTable.orderIndex);

    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, {
      userId,
      lessonId,
      exercises,
      answers: [],
      startedAt: new Date(),
    });

    // Auto-cleanup session after 2 hours
    setTimeout(() => sessions.delete(sessionId), 2 * 60 * 60 * 1000);

    return res.json({
      sessionId,
      lessonId,
      exercises: exercises.map(e => exerciseToResponse(e)),
      totalExercises: exercises.length,
      startedAt: new Date().toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/:sessionId/answer", async (req, res) => {
  const { sessionId } = req.params;
  const userId = requireAuth(req, res);
  if (!userId) return;

  const session = sessions.get(sessionId);
  if (!session || session.userId !== userId) {
    return res.status(404).json({ error: "session_not_found" });
  }

  const { exerciseId, answer } = req.body;
  const exercise = session.exercises.find(e => e.id === exerciseId);
  if (!exercise) return res.status(404).json({ error: "exercise_not_found" });

  const correct = exercise.correctAnswer.trim().toLowerCase() === String(answer).trim().toLowerCase();
  session.answers.push({ exerciseId, correct });

  const xpEarned = correct ? Math.floor(exercise.id % 3) + 3 : 0;

  return res.json({
    correct,
    correctAnswer: exercise.correctAnswer,
    explanation: correct ? null : `The correct answer is ${exercise.correctAnswer}`,
    xpEarned,
  });
});

router.post("/:sessionId/complete", async (req, res) => {
  const { sessionId } = req.params;
  const userId = requireAuth(req, res);
  if (!userId) return;

  const session = sessions.get(sessionId);
  if (!session || session.userId !== userId) {
    return res.status(404).json({ error: "session_not_found" });
  }

  const { correctAnswers, totalQuestions, timeSpentSeconds } = req.body;
  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  const perfectLesson = accuracy === 1;

  try {
    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, session.lessonId)).limit(1);
    if (!lesson) return res.status(404).json({ error: "lesson_not_found" });

    const baseXp = lesson.xpReward;
    const accuracyBonus = Math.floor(baseXp * accuracy);
    const perfectBonus = perfectLesson ? Math.floor(baseXp * 0.5) : 0;
    const xpEarned = accuracyBonus + perfectBonus;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "user_not_found" });

    const newXp = user.xp + xpEarned;
    const newLevel = Math.floor(newXp / 100) + 1;

    // Update streak
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newStreak = user.streakDays;
    let streakUpdated = false;

    if (user.lastActivityDate !== today) {
      if (user.lastActivityDate === yesterday) {
        newStreak = user.streakDays + 1;
      } else if (!user.lastActivityDate) {
        newStreak = 1;
      } else {
        newStreak = 1; // reset streak
      }
      streakUpdated = true;
    }

    const newMaxStreak = Math.max(user.maxStreak, newStreak);

    await db.update(usersTable).set({
      xp: newXp,
      level: newLevel,
      streakDays: newStreak,
      maxStreak: newMaxStreak,
      totalAnswers: user.totalAnswers + totalQuestions,
      correctAnswers: user.correctAnswers + correctAnswers,
      lastActivityDate: today,
    }).where(eq(usersTable.id, userId));

    // Update progress for this lesson
    const [existingProgress] = await db.select().from(userProgressTable)
      .where(and(eq(userProgressTable.userId, userId), eq(userProgressTable.lessonId, session.lessonId)))
      .limit(1);

    const newBestAccuracy = existingProgress?.bestAccuracy
      ? Math.max(existingProgress.bestAccuracy, accuracy)
      : accuracy;

    const newStatus = accuracy >= 0.8 ? "completed" : "in_progress";
    const finalStatus = existingProgress?.timesCompleted && existingProgress.timesCompleted >= 3 && accuracy >= 0.9 ? "mastered" : newStatus;

    if (existingProgress) {
      await db.update(userProgressTable).set({
        status: finalStatus,
        bestAccuracy: newBestAccuracy,
        timesCompleted: (existingProgress.timesCompleted || 0) + 1,
        lastCompletedAt: new Date(),
      }).where(eq(userProgressTable.id, existingProgress.id));
    } else {
      await db.insert(userProgressTable).values({
        userId,
        lessonId: session.lessonId,
        status: finalStatus,
        bestAccuracy: accuracy,
        timesCompleted: 1,
        lastCompletedAt: new Date(),
      });
    }

    // Unlock next lessons
    const allLessons = await db.select().from(lessonsTable).orderBy(lessonsTable.orderIndex);
    const lessonUnlocked: number[] = [];

    if (accuracy >= 0.6) {
      for (const nextLesson of allLessons) {
        const required: number[] = JSON.parse(nextLesson.requiredLessonIds || "[]");
        if (required.includes(session.lessonId)) {
          const [nextProgress] = await db.select().from(userProgressTable)
            .where(and(eq(userProgressTable.userId, userId), eq(userProgressTable.lessonId, nextLesson.id)))
            .limit(1);
          if (!nextProgress || nextProgress.status === "locked") {
            if (nextProgress) {
              await db.update(userProgressTable).set({ status: "available" }).where(eq(userProgressTable.id, nextProgress.id));
            } else {
              await db.insert(userProgressTable).values({
                userId,
                lessonId: nextLesson.id,
                status: "available",
                timesCompleted: 0,
              });
            }
            lessonUnlocked.push(nextLesson.id);
          }
        }
      }
    }

    sessions.delete(sessionId);

    return res.json({
      xpEarned,
      newLevel: newLevel !== user.level ? newLevel : null,
      streakUpdated,
      newStreak,
      accuracy,
      lessonUnlocked,
      perfectLesson,
      totalXp: newXp,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
