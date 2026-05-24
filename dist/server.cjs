
 
    import { createRequire } from 'module';
 
    const require = createRequire(import.meta.url);
 
   
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports2, module2) {
    "use strict";
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms2) {
      var msAbs = Math.abs(ms2);
      if (msAbs >= d) {
        return Math.round(ms2 / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms2 / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms2 / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms2 / s) + "s";
      }
      return ms2 + "ms";
    }
    function fmtLong(ms2) {
      var msAbs = Math.abs(ms2);
      if (msAbs >= d) {
        return plural(ms2, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms2, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms2, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms2, msAbs, s, "second");
      }
      return ms2 + " ms";
    }
    function plural(ms2, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// src/app.ts
var import_express3 = __toESM(require("express"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_cors = __toESM(require("cors"), 1);

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
var import_express = require("express");

// src/modules/auth/auth.service.ts
var import_bcrypt = __toESM(require("bcrypt"), 1);
var import_ms = __toESM(require_ms(), 1);

// src/db/index.ts
var import_pg = require("pg");

// src/config/index.ts
var import_dotenvx = __toESM(require("@dotenvx/dotenvx"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenvx.default.config({ path: import_path.default.join(process.cwd(), ".env") });
var config = {
  port: process.env.PORT || 5e3,
  connectionString: process.env.DATABASE_URL,
  secret: process.env.JWT_SECRET,
  access_token_expire: process.env.JWT_ACCESS_TOKEN_EXPIRE,
  refresh_secret: process.env.JWT_REFRESH_SECRET,
  refresh_token_expire: process.env.JWT_ACCESS_TOKEN_EXPIRE
};

// src/db/index.ts
var pool = new import_pg.Pool({
  connectionString: config.connectionString
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
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
function sendJWT(res, user, tokenType) {
  if (tokenType === "access_token") {
    const secret = config.secret;
    const options = {
      expiresIn: config.access_token_expire
    };
    const token = import_jsonwebtoken.default.sign(user, secret, options);
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
    const token = import_jsonwebtoken.default.sign(user, secret, options);
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
  const hashedPassword = await import_bcrypt.default.hash(password, 12);
  const user = await pool.query(
    `INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, email, hashedPassword, role]
  );
  delete user.rows[0].password;
  return user.rows[0];
}
async function checkPassword(password, hashedPassword) {
  return await import_bcrypt.default.compare(password, hashedPassword);
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
    const decoded = import_jsonwebtoken.default.verify(token, secret);
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
    if (error instanceof import_jsonwebtoken.default.TokenExpiredError) {
      throw new AppError("Refresh token expired", 401);
    }
    if (error instanceof import_jsonwebtoken.default.JsonWebTokenError) {
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
var authRouter = (0, import_express.Router)();
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/refresh-token", refreshToken);
var auth_router_default = authRouter;

// src/modules/issue/router.ts
var import_express2 = require("express");
var issueRouter = (0, import_express2.Router)();
var router_default = issueRouter;

// src/app.ts
var app = (0, import_express3.default)();
app.use((0, import_cookie_parser.default)());
app.use(import_express3.default.json());
app.use(import_express3.default.text());
app.use(import_express3.default.text());
app.use(import_express3.default.urlencoded({ extended: true }));
app.use(
  (0, import_cors.default)({
    origin: "http://localhost:5173, http://localhost:3000, http://localhost:5174, http://localhost:3001",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use("/api/auth", auth_router_default);
app.use("/api/issues", router_default);
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
//# sourceMappingURL=server.cjs.map