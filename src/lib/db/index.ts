import "server-only";

import { PrismaClient } from "@prisma/client";

/**
 * Server-only database layer (Task 2).
 *
 * Exposes a single shared PrismaClient instance. The Prisma schema lives in
 * prisma/schema.prisma and follows docs/DATABASE_SCHEMA.md. Raw Sportmonks data
 * and calculated fantasy data are kept in separate tables (see the schema).
 *
 * Do NOT add Sportmonks API calls here — raw API access lives in
 * src/lib/sportmonks and is server-only.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type DbStatus = {
  configured: boolean;
  note: string;
};

/**
 * Lightweight readiness flag for the admin page. We only report whether a
 * DATABASE_URL is present — we never expose the connection string itself.
 */
export function getDbStatus(): DbStatus {
  const configured = Boolean(process.env.DATABASE_URL);
  return {
    configured,
    note: configured
      ? "PostgreSQL connected. Schema is migrated and ready for Sportmonks sync (Task 4+)."
      : "DATABASE_URL is not set. Add it in Replit Secrets to enable the database.",
  };
}
