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

issueRouter.route("/").post(createIssue).get(getAllIssues);

issueRouter
  .route("/:id")
  .get(getSingleIssue)
  .patch(updateIssue)
  .delete(deleteIssue);

export default issueRouter;
