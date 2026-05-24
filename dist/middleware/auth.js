import { catchAsync } from "../utils/catch_async.js";
import { checkJWTToken } from "../modules/auth/auth.service.js";
import { AppError } from "../modules/error/error.js";
export const authChecker = catchAsync(async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        throw new AppError("Please login first", 401);
    }
    const user = await checkJWTToken(token, "access_token");
    req.user = user;
    next();
});
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new AppError("You are not authorized to perform this action", 403);
        }
        next();
    };
};
//# sourceMappingURL=auth.js.map