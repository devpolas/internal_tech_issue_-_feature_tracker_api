import bcrypt from "bcrypt";
import { pool } from "../../db/index.js";
import { AppError } from "../error/error.js";
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
    return new AppError("Already registered with this email", 400);
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
}) {}
