import { Router } from "express";
import {
  createIssue,
  deleteIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
} from "./issue.controller";
import { authChecker } from "../../middleware/auth";

const issueRouter = Router();

issueRouter.use(authChecker);

issueRouter.post("/", createIssue);
issueRouter.get("/", getAllIssues);
issueRouter.get("/:id", getSingleIssue);
issueRouter.patch("/:id", updateIssue);
issueRouter.delete("/:id", deleteIssue);

export default issueRouter;
