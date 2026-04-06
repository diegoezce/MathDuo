import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import passport from "passport";
import router from "./routes";
import { logger } from "./lib/logger";
import { seedLessons } from "./seed";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use("/api", router);

seedLessons().catch(err => logger.error({ err }, "Failed to seed lessons"));

export default app;
