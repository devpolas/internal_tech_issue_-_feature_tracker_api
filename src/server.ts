import app from "./app.js";
import { config } from "./config/index.js";
import { initDB } from "./db/index.js";
import { Server } from "http";

let server: Server;

// 1. Register global safety nets immediately before running any async functions
process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// 2. Start server
async function startServer() {
  try {
    // await initDB();
    // console.log("Database connected and schemas verified.");

    server = app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (err) {
    console.error("FATAL: Failed to initialize application sequence", err);
    process.exit(1);
  }
}

startServer();
