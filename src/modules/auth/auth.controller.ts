import type { Request, Response } from "express";
import { AppError } from "../error/error.js";
import { createUserIntoDB } from "./auth.service.js";

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
