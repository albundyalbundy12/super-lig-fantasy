import "server-only";

/**
 * Placeholder database layer.
 *
 * The real schema (PostgreSQL + ORM) is introduced in Task 2 per
 * docs/DATABASE_SCHEMA.md and docs/CODING_AGENT_TASKS.md. This module exists
 * so application code has a single, stable import point for data access from
 * the very first scaffold — but it intentionally performs no real queries yet.
 *
 * Do NOT add Sportmonks API calls here. Raw API access lives in
 * src/lib/sportmonks and is server-only. Raw (Sportmonks) data and calculated
 * fantasy data must stay separated (see docs/DATABASE_SCHEMA.md).
 */

export type DbStatus = {
  configured: boolean;
  note: string;
};

export function getDbStatus(): DbStatus {
  return {
    configured: false,
    note: "Database layer not implemented yet. Scheduled for Task 2 (schema).",
  };
}
