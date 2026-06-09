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

issueRouter.route("/").get(getAllIssues);

issueRouter.use(authChecker);

issueRouter.route("/").post(createIssue);

issueRouter
  .route("/:id")
  .get(getSingleIssue)
  .patch(updateIssue)
  .delete(deleteIssue);

export default issueRouter;
