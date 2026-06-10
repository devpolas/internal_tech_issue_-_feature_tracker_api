import { pool } from "../../db";
import { AppError } from "../error/error";

interface IssueInput {
  title?: string;
  description?: string;
  type?: string;
}

export async function createIssueIntoDB(
  payload: IssueInput,
  reporter_id: Number,
) {
  const { title, description, type } = payload;

  const issue = await pool.query(
    `INSERT INTO issues (title,description,type,reporter_id) VALUES ($1,$2,$3,$4) RETURNING *`,
    [title, description, type, reporter_id],
  );

  return issue.rows[0];
}

export async function getAllIssuesFromDB() {
  const result = await pool.query(`
    SELECT
      i.id,
      i.title,
      i.description,
      i.type,
      i.status,
      i.created_at,
      i.updated_at,
      json_build_object(
        'id', u.id,
        'name', u.name,
        'role', u.role
      ) AS reporter
    FROM issues AS i
    JOIN users AS u
      ON i.reporter_id = u.id
  `);

  return result.rows ?? [];
}

export async function getSingleIssueFromDB(id: number) {
  const issue = await pool.query(
    `
    SELECT
      i.id,
      i.title,
      i.description,
      i.type,
      i.status,
      i.created_at,
      i.updated_at,
      json_build_object(
        'id', u.id,
        'name', u.name,
        'role', u.role
      ) AS reporter
    FROM issues AS i
    JOIN users AS u
      ON i.reporter_id = u.id
    WHERE i.id = $1
    `,
    [id],
  );

  return issue.rows[0];
}

export async function updateIssueInDB(
  issueId: number,
  userId: number,
  userRole: string,
  payload: IssueInput,
) {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    issueId,
  ]);

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new AppError("Issue not found", 404);
  }

  const isMaintainer = userRole === "maintainer";

  const isOwnerContributor =
    userRole === "contributor" &&
    issue.reporter_id === userId &&
    issue.status === "open";

  if (!isMaintainer && !isOwnerContributor) {
    throw new AppError("You are not authorized to update this issue", 403);
  }

  const result = await pool.query(
    `
    UPDATE issues
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      updated_at = NOW()
    WHERE id = $4
    RETURNING *
    `,
    [payload.title, payload.description, payload.type, issueId],
  );

  return result.rows[0];
}

export async function deleteIssueFromDB(issueId: Number) {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    issueId,
  ]);

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new AppError("Issue not found", 404);
  }
  await pool.query(`DELETE FROM issues WHERE id = $1 RETURNING *`, [issueId]);
}
