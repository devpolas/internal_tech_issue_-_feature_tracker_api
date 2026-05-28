import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catch_async";
import { AppError } from "../error/error";
import { createIssueIntoDB } from "./issue.service";
import { sendResponse } from "../../utils/send_response";

export const createIssue = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;

  const { title, description, type } = body;
  if (!title || !description || !type) {
    throw new AppError("title,description and type are required", 400);
  }

  const issue = await createIssueIntoDB({ title, description, type });

  if (!issue) {
    throw new AppError("Failed to create issue", 500);
  }

  sendResponse(res, {
    success: true,
    message: "Issue created successfully",
    statusCode: 201,
    data: issue,
  });
});
