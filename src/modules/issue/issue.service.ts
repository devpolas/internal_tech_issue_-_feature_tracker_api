import { pool } from "../../db";

interface IssueInput {
  title: string;
  description: string;
  type: string;
}

export async function createIssueIntoDB(payload: IssueInput) {
  const { title, description, type } = payload;

  const issue = await pool.query(
    `INSERT INTO issues (title,description,type) VALUES ($1,$2,$3) RETURNING *`,
    [title, description, type],
  );

  return issue.rows[0];
}
