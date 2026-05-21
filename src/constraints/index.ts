import dotenvx from "@dotenvx/dotenvx";
import path from "path";

dotenvx.config({ path: path.join(process.cwd(), ".env") });

export const PORT = process.env.PORT || 5000;

export const NEONDB_URL = process.env.NEONDB_URL as string;

export const NEONDB_USER = process.env.NEONDB_USER as string;

export const NEONDB_PASSWORD = process.env.NEONDB_PASSWORD as string;
