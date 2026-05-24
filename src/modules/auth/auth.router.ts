import { Router } from "express";
import { login, refreshToken, signup } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/refresh-token", refreshToken);

export default authRouter;
