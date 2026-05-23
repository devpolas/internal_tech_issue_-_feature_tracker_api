import dotenvx from "@dotenvx/dotenvx";
import path from "path";

dotenvx.config({ path: path.join(process.cwd(), ".env") });

export const config = {
  port: process.env.PORT || 5000,
  connectionString: process.env.DATABASE_URL as string,
};
