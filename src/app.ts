import express, { type Application } from "express";
import CookieParser from "cookie-parser";
import { AppError } from "./modules/error/error.js";
import { globalErrorController } from "./modules/error/error.controller.js";
import authRouter from "./modules/auth/auth.router.js";
import issueRouter from "./modules/issue/router.js";

const app: Application = express();

app.use(CookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);

app.all("/{*splat}", async (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

// control all errors
app.use(globalErrorController);

export default app;
