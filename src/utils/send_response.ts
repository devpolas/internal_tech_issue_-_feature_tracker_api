import type { Response } from "express";

interface ResponseInterface<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}

export function sendResponse<T>(
  res: Response,
  responseData: ResponseInterface<T>,
) {
  res.status(responseData.statusCode).json({
    success: responseData.success,
    message: responseData.message,
    data: responseData.data,
  });
}
