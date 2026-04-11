import type { RegisterApi } from "openclaw/plugin-sdk/plugin-entry";
import type { PrismaClient } from "@prisma/client";

export function registerRunSql(
  api: RegisterApi,
  adminPrisma: PrismaClient,
) {
  api.registerTool({
    name: "run_sql",
    label: "Run SQL",
    description:
      "Execute arbitrary SQL against the TBDC database with full DDL + DML permissions. Can SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, ALTER TABLE, DROP TABLE, CREATE INDEX, etc. Returns rows for SELECT queries, or affected row count for write operations. Use describe_schema first to understand the data model. BE CAREFUL: there is no undo for destructive operations.",
    parameters: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description:
            "The SQL statement to execute. Can be any valid PostgreSQL SQL including DDL (CREATE, ALTER, DROP) and DML (SELECT, INSERT, UPDATE, DELETE). Multiple statements separated by semicolons are NOT supported — send one statement at a time.",
        },
      },
      required: ["sql"],
      additionalProperties: false,
    },
    async execute(_id, params) {
      const sql = String(params.sql ?? "").trim();
      if (!sql) {
        return {
          content: [{ type: "text", text: "error: sql parameter is required" }],
          details: { error: true },
        };
      }

      try {
        // Prisma's $queryRawUnsafe handles both SELECT and DDL/DML
        const result = await adminPrisma.$queryRawUnsafe(sql);

        // Format the result
        if (Array.isArray(result)) {
          // SELECT query — return rows
          const rowCount = result.length;
          const preview =
            rowCount > 50
              ? `Showing first 50 of ${rowCount} rows`
              : `${rowCount} row${rowCount === 1 ? "" : "s"}`;

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    ok: true,
                    rowCount,
                    note: preview,
                    rows: result.slice(0, 50),
                  },
                  // BigInt serialization
                  (_key, value) =>
                    typeof value === "bigint" ? Number(value) : value,
                  2,
                ),
              },
            ],
          };
        }

        // DDL or DML — result might be a count or undefined
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { ok: true, result: String(result) },
                null,
                2,
              ),
            },
          ],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ok: false, error: msg }, null, 2),
            },
          ],
          details: { error: true },
        };
      }
    },
  });
}
