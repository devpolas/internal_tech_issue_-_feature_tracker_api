import type { Request, Response } from "express";
import { AppError } from "../error/error.js";
import {
  checkJWTToken,
  createUserIntoDB,
  loginUserFromDb,
  sendJWT,
} from "./auth.service.js";

export async function signup(req: Request, res: Response) {
  try {
    const body = req.body;
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return new AppError("Name, Email, Password and Role are required", 400);
    }

    const result = await createUserIntoDB({ name, email, password, role });

    if (!result) {
      return new AppError("Failed to create user", 500);
    }

    sendJWT(res, result, "access_token");

    res.status(201).json({
      success: true,
      message: "User Created successfully!",
      data: result,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const body = req.body;
    const { email, password } = body;

    if (!email || !password) {
      return new AppError("Email and Password are required", 400);
    }

    const result = await loginUserFromDb({ email, password });
    if (!result) {
      return new AppError("Invalid email or password", 401);
    }
    sendJWT(res, result, "access_token");

    res.status(200).json({
      success: true,
      message: "User login successfully!",
      data: result,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const result = await checkJWTToken(req.cookies.refresh_token);

    if (!result) {
      return new AppError("Unauthorized", 401);
    }

    sendJWT(res, result, "access_token");

    res.status(200).json({
      success: true,
      message: "Access token generated!",
      data: result,
    });
  } catch (error) {
    console.error(error);
  }
}
