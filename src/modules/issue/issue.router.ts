import { Router } from "express";
import {
  createIssue,
  deleteIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
} from "./issue.controller";
import { authChecker, restrictTo } from "../../middleware/auth";

const issueRouter = Router();

issueRouter.route("/").get(getAllIssues);
issueRouter.route("/:id").get(getSingleIssue);

issueRouter.use(authChecker);

issueRouter.route("/").post(createIssue);

issueRouter
  .route("/:id")
  .patch(updateIssue)
  .delete(restrictTo("maintainer"), deleteIssue);

export default issueRouter;
