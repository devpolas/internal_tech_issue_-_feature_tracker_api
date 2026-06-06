import { pool } from "../../db";

interface IssueInput {
  title: string;
  description: string;
  type: string;
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
  const issues = await pool.query(
    `SELECT * FROM issues JOIN user ON issues.reporter_id = user.id`,
  );
  return issues.rows;
}

export async function getSingleIssueFromDB(id: number) {
  const issue = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
  return issue.rows[0];
}

export async function updateIssueIntoDB(id: number, payload: IssueInput) {
  const { title, description, type } = payload;
  const updatedIssue = await pool.query(
    `UPDATE issues SET title = $1, description = $2, type = $3 WHERE id = $4 RETURNING *`,
    [title, description, type, id],
  );

  return updatedIssue.rows[0];
}

export async function deleteIssueFromDB(id: Number) {
  await pool.query(`DELETE FROM issues WHERE id = $1 RETURNING *`, [id]);
}
