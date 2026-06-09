import { pool } from "../../db";
import { AppError } from "../error/error";

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

export async function updateIssueIntoDB(id: number, payload: IssueInput) {
  const fields = Object.entries(payload).filter(([_, v]) => v !== undefined);

  if (fields.length === 0) {
    throw new AppError("No fields to update", 400);
  }

  const setClauses = fields.map(([key], i) => `${key} = $${i + 1}`).join(", ");
  const values = fields.map(([_, v]) => v);

  const updatedIssue = await pool.query(
    `UPDATE issues SET ${setClauses} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, id],
  );

  return updatedIssue.rows[0];
}

export async function deleteIssueFromDB(id: Number) {
  await pool.query(`DELETE FROM issues WHERE id = $1 RETURNING *`, [id]);
}
