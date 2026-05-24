import type { AuthTokenType, User } from "./auth.js";
import type { Response } from "express";
export declare function sendJWT(res: Response, user: User, tokenType: AuthTokenType): void;
export declare function createUserIntoDB(payload: {
    name: string;
    email: string;
    password: string;
    role: string;
}): Promise<any>;
export declare function loginUserFromDb(payload: {
    email: string;
    password: string;
}): Promise<any>;
export declare function checkJWTToken(token: string, tokenType: AuthTokenType): Promise<any>;
//# sourceMappingURL=auth.service.d.ts.map