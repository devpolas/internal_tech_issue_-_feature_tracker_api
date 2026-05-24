import type { NextFunction, Request, Response } from "express";
import { AppError } from "../error/error.js";
import {
  checkJWTToken,
  createUserIntoDB,
  loginUserFromDb,
  sendJWT,
} from "./auth.service.js";
import { catchAsync } from "../../utils/catch_async.js";
import { sendResponse } from "../../utils/send_response.js";

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return next(
        new AppError("Name, Email, Password and Role are required", 400),
      );
    }

    const result = await createUserIntoDB(
      { name, email, password, role },
      next,
    );

    if (!result) {
      return next(new AppError("Failed to create user", 500));
    }

    sendJWT(res, result, "access_token");
    sendJWT(res, result, "refresh_token");

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User Created successfully!",
      data: result,
    });
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const { email, password } = body;

    if (!email || !password) {
      return next(new AppError("Email and Password are required", 400));
    }

    const result = await loginUserFromDb({ email, password }, next);
    if (!result) {
      return next(new AppError("Invalid email or password", 401));
    }
    sendJWT(res, result, "access_token");
    sendJWT(res, result, "refresh_token");

    res.status(200).json({
      success: true,
      message: "User login successfully!",
      data: result,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User login successfully!",
      data: result,
    });
  },
);

export const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await checkJWTToken(req.cookies.refresh_token, next);

    if (!result) {
      return next(new AppError("Unauthorized", 401));
    }

    sendJWT(res, result, "access_token");
    sendJWT(res, result, "refresh_token");

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Access token generated!",
      data: result,
    });
  },
);
