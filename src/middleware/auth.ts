import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catch_async.js";
import { checkJWTToken } from "../modules/auth/auth.service.js";
import { AppError } from "../modules/error/error.js";
import type { UserRole } from "../modules/auth/auth.js";

export const authChecker = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      throw new AppError("Please login first", 401);
    }

    const user = await checkJWTToken(token, "access_token");

    req.user = user;

    next();
  },
);

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("You are not authorized to perform this action", 403);
    }

    next();
  };
};
