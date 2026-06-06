
 
    import { createRequire } from 'module';
 
    const require = createRequire(import.meta.url);
 
   

// src/app.ts
import express from "express";
import CookieParser from "cookie-parser";
import cors from "cors";

// src/modules/error/error.ts
var AppError = class extends Error {
  statusCode;
  status;
  isOperational;
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};

// src/modules/error/error.controller.ts
var sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
var sendProductionError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "something went very wrong!"
    });
  }
};
var globalErrorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, name: err.name };
    sendProductionError(error, res);
  }
};

// src/modules/auth/auth.router.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenvx from "@dotenvx/dotenvx";
import path from "path";
dotenvx.config({ path: path.join(process.cwd(), ".env") });
var config = {
  port: process.env.PORT || 5e3,
  connectionString: process.env.DATABASE_URL,
  secret: process.env.JWT_SECRET,
  access_token_expire: process.env.JWT_ACCESS_TOKEN_EXPIRE,
  refresh_secret: process.env.JWT_REFRESH_SECRET,
  refresh_token_expire: process.env.JWT_ACCESS_TOKEN_EXPIRE
};

// src/db/index.ts
var pool = new Pool({
  connectionString: config.connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 1e4
});
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(30) NOT NULL DEFAULT 'contributor',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(30) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'open',
        reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
  } finally {
    client.release();
  }
}

// src/modules/auth/auth.service.ts
import jwt from "jsonwebtoken";
function sendJWT(res, user, tokenType) {
  if (tokenType === "access_token") {
    const secret = config.secret;
    const options = {
      expiresIn: config.access_token_expire
    };
    const token = jwt.sign(user, secret, options);
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });
  } else if (tokenType === "refresh_token") {
    const secret = config.refresh_secret;
    const options = {
      expiresIn: config.refresh_token_expire
    };
    const token = jwt.sign(user, secret, options);
    res.cookie("refresh_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });
  }
}
async function createUserIntoDB(payload) {
  const { name, email, password, role } = payload;
  const existingUser = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  if (existingUser.rows.length > 0) {
    throw new AppError("Already registered with this email", 400);
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await pool.query(
    `INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, email, hashedPassword, role]
  );
  delete user.rows[0].password;
  return user.rows[0];
}
async function checkPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
async function loginUserFromDb(payload) {
  const { email, password } = payload;
  const user = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email
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
async function checkJWTToken(token, tokenType) {
  try {
    if (!token) {
      throw new AppError("Unauthorized", 401);
    }
    const secret = tokenType === "access_token" ? config.secret : config.refresh_secret;
    const decoded = jwt.verify(token, secret);
    const userData = await pool.query(`SELECT * FROM users WHERE email=$1`, [
      decoded.email
    ]);
    if (userData.rows.length === 0) {
      throw new AppError("User not found!", 404);
    }
    const user = userData.rows[0];
    delete user.password;
    return user;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Refresh token expired", 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid refresh token", 401);
    }
    throw error;
  }
}

// src/utils/catch_async.ts
var catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// src/utils/send_response.ts
function sendResponse(res, responseData) {
  res.status(responseData.statusCode).json({
    success: responseData.success,
    message: responseData.message,
    data: responseData.data
  });
}

// src/modules/auth/auth.controller.ts
var signup = catchAsync(async (req, res) => {
  const body = req.body;
  const { name, email, password, role } = body;
  if (!name || !email || !password || !role) {
    throw new AppError("Name, Email, Password and Role are required", 400);
  }
  const result = await createUserIntoDB({ name, email, password, role });
  if (!result) {
    throw new AppError("Failed to create user", 500);
  }
  sendJWT(res, result, "access_token");
  sendJWT(res, result, "refresh_token");
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User Created successfully!",
    data: result
  });
});
var login = catchAsync(async (req, res) => {
  const body = req.body;
  const { email, password } = body;
  if (!email || !password) {
    throw new AppError("Email and Password are required", 400);
  }
  const result = await loginUserFromDb({ email, password });
  if (!result) {
    throw new AppError("Invalid email or password", 401);
  }
  sendJWT(res, result, "access_token");
  sendJWT(res, result, "refresh_token");
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User login successfully!",
    data: result
  });
});
var refreshToken = catchAsync(async (req, res) => {
  const result = await checkJWTToken(
    req.cookies.refresh_token,
    "refresh_token"
  );
  if (!result) {
    throw new AppError("Unauthorized", 401);
  }
  sendJWT(res, result, "access_token");
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access token generated!",
    data: result
  });
});

// src/modules/auth/auth.router.ts
var authRouter = Router();
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/refresh-token", refreshToken);
var auth_router_default = authRouter;

// src/modules/issue/issue.router.ts
import { Router as Router2 } from "express";

// src/modules/issue/issue.service.ts
async function createIssueIntoDB(payload, reporter_id) {
  const { title, description, type } = payload;
  const issue = await pool.query(
    `INSERT INTO issues (title,description,type,reporter_id) VALUES ($1,$2,$3,$4) RETURNING *`,
    [title, description, type, reporter_id]
  );
  return issue.rows[0];
}
async function getAllIssuesFromDB() {
  const issues = await pool.query(
    `SELECT * FROM issues JOIN user ON issues.reporter_id = user.id`
  );
  return issues.rows;
}
async function getSingleIssueFromDB(id) {
  const issue = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
  return issue.rows[0];
}
async function updateIssueIntoDB(id, payload) {
  const { title, description, type } = payload;
  const updatedIssue = await pool.query(
    `UPDATE issues SET title = $1, description = $2, type = $3 WHERE id = $4 RETURNING *`,
    [title, description, type, id]
  );
  return updatedIssue.rows[0];
}
async function deleteIssueFromDB(id) {
  await pool.query(`DELETE FROM issues WHERE id = $1 RETURNING *`, [id]);
}

// src/modules/issue/issue.controller.ts
var createIssue = catchAsync(async (req, res) => {
  const body = req.body;
  const user = req.user;
  const { title, description, type } = body;
  if (!title || !description || !type) {
    throw new AppError("title,description and type are required", 400);
  }
  if (!user) {
    throw new AppError("Unauthorized", 401);
  }
  const issue = await createIssueIntoDB({ title, description, type }, user.id);
  if (!issue) {
    throw new AppError("Failed to create issue", 500);
  }
  sendResponse(res, {
    success: true,
    message: "Issue created successfully",
    statusCode: 201,
    data: issue
  });
});
var getAllIssues = catchAsync(async (req, res) => {
  const issues = await getAllIssuesFromDB();
  if (!issues) {
    throw new AppError("Failed to fetch issues", 500);
  }
  sendResponse(res, {
    success: true,
    message: "Issues retrived successfully",
    statusCode: 200,
    data: issues
  });
});
var getSingleIssue = catchAsync(
  async (req, res) => {
    const id = req.params.id;
    const issue = await getSingleIssueFromDB(Number(id));
    if (!issue) {
      throw new AppError("Issue not found", 404);
    }
    sendResponse(res, {
      statusCode: 200,
      message: "Issue retrived successfully",
      success: true,
      data: issue
    });
  }
);
var updateIssue = catchAsync(async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const { title, description, type } = body;
  if (!title || !description || !type) {
    throw new AppError("title,description and type are required", 400);
  }
  const updatedIssue = await updateIssueIntoDB(Number(id), {
    title,
    description,
    type
  });
  if (!updatedIssue) {
    throw new AppError("Failed to update issue", 500);
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Issue updated successfully",
    data: updatedIssue
  });
});
var deleteIssue = catchAsync(async (req, res) => {
  const id = req.params.id;
  await deleteIssueFromDB(Number(id));
  sendResponse(res, {
    statusCode: 204,
    success: true,
    message: "Issue deleted successfully"
  });
});

// src/middleware/auth.ts
var authChecker = catchAsync(
  async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      throw new AppError("Please login first", 401);
    }
    const user = await checkJWTToken(token, "access_token");
    req.user = user;
    next();
  }
);

// src/modules/issue/issue.router.ts
var issueRouter = Router2();
issueRouter.use(authChecker);
issueRouter.route("/").post(createIssue).get(getAllIssues);
issueRouter.route("/:id").get(getSingleIssue).patch(updateIssue).delete(deleteIssue);
var issue_router_default = issueRouter;

// src/app.ts
var app = express();
app.use(CookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173, http://localhost:3000, http://localhost:5174, http://localhost:3001",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use("/api/auth", auth_router_default);
app.use("/api/issues", issue_router_default);
app.all("/{*splat}", async (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorController);
var app_default = app;

// src/server.ts
var server;
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! \u{1F4A5} Shutting down...");
  console.error(err.name, err.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! \u{1F4A5} Shutting down...");
  console.error(err.name, err.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
async function startServer() {
  try {
    await initDB();
    console.log("Database connected and schemas verified.");
    server = app_default.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (err) {
    console.error("FATAL: Failed to initialize application sequence", err);
    process.exit(1);
  }
}
startServer();
//# sourceMappingURL=server.js.map