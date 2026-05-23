import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../error/error.js";
import { createUserIntoDB } from "./auth.service.js";
import type { AuthTokenType, User } from "./auth.js";
import { config } from "../../config/index.js";

function sendJWT(res: Response, user: User, tokenType: AuthTokenType) {
  if (tokenType === "access_token") {
    const token = jwt.sign(user, config.secret as string, {
      expiresIn: config.access_token_expire!,
    });
  }
}

export async function signup(req: Request, res: Response) {
  try {
    const body = req.body;
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return new AppError("Name, Email, Password and Role are required", 400);
    }

    const result = await createUserIntoDB({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
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
  } catch (error) {
    console.error(error);
  }
}
