import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import googleAuthRouter from "./google-auth";
import usersRouter from "./users";
import lessonsRouter from "./lessons";
import progressRouter from "./progress";
import gamificationRouter from "./gamification";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/auth", googleAuthRouter);
router.use("/users", usersRouter);
router.use("/lessons", lessonsRouter);
router.use("/sessions", lessonsRouter);
router.use("/progress", progressRouter);
router.use("/gamification", gamificationRouter);

export default router;
