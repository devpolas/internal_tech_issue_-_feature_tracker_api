import dotenvx from "@dotenvx/dotenvx";
import path from "path";

dotenvx.config({ path: path.join(process.cwd(), ".env") });

export const config = {
  port: process.env.PORT || 5000,
  connectionString: process.env.DATABASE_URL as string,
  secret: process.env.JWT_SECRET,
  access_token_expire: process.env.JWT_ACCESS_TOKEN_EXPIRE,
  refresh_secret: process.env.JWT_REFRESH_SECRET,
  refresh_token_expire: process.env.JWT_ACCESS_TOKEN_EXPIRE,
};
