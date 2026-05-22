import dotenvx from "@dotenvx/dotenvx";
import path from "path";

dotenvx.config({ path: path.join(process.cwd(), ".env") });

export const config = {
  PORT: process.env.PORT || 5000,
  NEONDB_URL: process.env.DATABASE_URL as string,
};
