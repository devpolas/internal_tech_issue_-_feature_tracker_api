export function sendResponse(res, responseData) {
    res.status(responseData.statusCode).json({
        success: responseData.success,
        message: responseData.message,
        data: responseData.data,
    });
}
//# sourceMappingURL=send_response.js.map