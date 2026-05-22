import express, { type Application } from "express";
import CookieParser from "cookie-parser";
import { AppError } from "./modules/error/app_error.js";
import { globalErrorController } from "./modules/error/error_controller.js";

const app: Application = express();

app.use(CookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ status: "success", message: "welcome to the api" });
});

app.all("/{*splat}", async (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

// control all errors
app.use(globalErrorController);

export default app;
