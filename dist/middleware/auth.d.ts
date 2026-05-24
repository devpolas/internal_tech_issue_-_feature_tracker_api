import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../modules/auth/auth.js";
export declare const authChecker: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const restrictTo: (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map