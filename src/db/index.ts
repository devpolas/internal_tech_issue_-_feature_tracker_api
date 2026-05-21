import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import {
  NEONDB_PASSWORD,
  NEONDB_URL,
  NEONDB_USER,
} from "../constraints/index.js";
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = NEONDB_URL.replace("<NEONDB_USER>", NEONDB_USER).replace(
  "<NEONDB_PASSWORD>",
  NEONDB_PASSWORD,
);

export const pool = new Pool({ connectionString: DATABASE_URL });

export async function initDB() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'contributor',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(30) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'open',
      reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )`);
}
