const sendDevError = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const sendProductionError = (err, res) => {
    // Don't send accidentally other error
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        // when it was not operational error send the default error
        res.status(500).json({
            status: "error",
            message: "something went very wrong!",
        });
    }
};
export const globalErrorController = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "development") {
        sendDevError(err, res);
    }
    else if (process.env.NODE_ENV === "production") {
        let error = { ...err, name: err.name };
        sendProductionError(error, res);
    }
};
//# sourceMappingURL=error.controller.js.map