import bcrypt from "bcrypt";
import ms from "ms";
import { pool } from "../../db/index.js";
import { AppError } from "../error/error.js";
import jwt, {
  type JwtPayload,
  type Secret,
  type SignOptions,
} from "jsonwebtoken";
import type { AuthTokenType, User } from "./auth.js";
import { config } from "../../config/index.js";
import type { Response } from "express";

export function sendJWT(res: Response, user: User, tokenType: AuthTokenType) {
  if (tokenType === "access_token") {
    const secret: Secret = config.secret as string;
    const options: SignOptions = {
      expiresIn: config.access_token_expire as ms.StringValue,
    };
    const token = jwt.sign(user, secret, options);
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } else if (tokenType === "refresh_token") {
    const secret: Secret = config.refresh_secret as string;
    const options: SignOptions = {
      expiresIn: config.refresh_token_expire as ms.StringValue,
    };
    const token = jwt.sign(user, secret, options);
    res.cookie("refresh_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
}
export async function createUserIntoDB(payload: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const { name, email, password, role } = payload;

  const existingUser = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email],
  );

  if (existingUser.rows.length > 0) {
    throw new AppError("Already registered with this email", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await pool.query(
    `INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, email, hashedPassword, role],
  );

  delete user.rows[0].password;

  return user.rows[0];
}

async function checkPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function loginUserFromDb(payload: {
  email: string;
  password: string;
}) {
  const { email, password } = payload;
  const user = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  if (user.rows.length === 0) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await checkPassword(password, user.rows[0].password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  delete user.rows[0].password;

  return user.rows[0];
}

export async function checkJWTToken(token: string) {
  try {
    if (!token) {
      throw new AppError("Unauthorized", 401);
    }

    const decoded = jwt.verify(
      token,
      config.refresh_secret as string,
    ) as JwtPayload;

    const userData = await pool.query(`SELECT * FROM users WHERE email=$1`, [
      decoded.email,
    ]);

    if (userData.rows.length === 0) {
      throw new AppError("User not found!", 404);
    }

    const user = userData.rows[0];

    delete user.password;

    return user;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      if (error.name === "TokenExpiredError") {
        throw new AppError("Refresh token expired", 401);
      }
    }

    if (error instanceof jwt.JsonWebTokenError) {
      if (error.name === "JsonWebTokenError") {
        throw new AppError("Invalid refresh token", 401);
      }
    }

    throw error;
  }
}
