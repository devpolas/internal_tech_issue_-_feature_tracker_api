import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch_async";
import { AppError } from "../error/error";
import {
  createIssueIntoDB,
  deleteIssueFromDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueInDB,
} from "./issue.service";
import { sendResponse } from "../../utils/send_response";
import { IssueType } from "./issue";

export const createIssue = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const user = req.user;

  const { title, description, type } = body;

  if (!title || !description || !type) {
    throw new AppError("title,description and type are required", 400);
  }

  const validTypes: IssueType[] = ["bug", "feature_request"];

  if (type && !validTypes.includes(type)) {
    throw new AppError("Invalid issue type", 400);
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
    data: issue,
  });
});

export const getAllIssues = catchAsync(async (req: Request, res: Response) => {
  const issues = await getAllIssuesFromDB();

  if (!issues) {
    throw new AppError("Failed to fetch issues", 500);
  }

  sendResponse(res, {
    success: true,
    message: "Issues retrived successfully",
    statusCode: 200,
    data: issues,
  });
});

export const getSingleIssue = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;

    const issue = await getSingleIssueFromDB(Number(id));

    if (!issue) {
      throw new AppError("Issue not found", 404);
    }

    sendResponse(res, {
      statusCode: 200,
      message: "Issue retrived successfully",
      success: true,
      data: issue,
    });
  },
);

export const updateIssue = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const body = req.body;
  const user = req.user;

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  const { title, description, type } = body;
  if (!title || !description || !type) {
    throw new AppError("title,description and type are required", 400);
  }

  const updatedIssue = await updateIssueInDB(Number(id), user.id, user.role, {
    title,
    description,
    type,
  });

  if (!updatedIssue) {
    throw new AppError("Failed to update issue", 500);
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Issue updated successfully",
    data: updatedIssue,
  });
});

export const deleteIssue = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  await deleteIssueFromDB(Number(id));

  sendResponse(res, {
    statusCode: 204,
    success: true,
    message: "Issue deleted successfully",
  });
});
