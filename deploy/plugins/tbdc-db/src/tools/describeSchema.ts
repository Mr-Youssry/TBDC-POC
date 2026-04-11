import type { RegisterApi } from "openclaw/plugin-sdk/plugin-entry";
import type { PrismaClient } from "@prisma/client";

export function registerDescribeSchema(
  api: RegisterApi,
  adminPrisma: PrismaClient,
) {
  api.registerTool({
    name: "describe_schema",
    label: "Describe Database Schema",
    description:
      "Returns the full database schema: all tables, their columns, data types, constraints, indexes, enums, and foreign key relationships. Use this before running SQL to understand the data model. No parameters needed.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    async execute(_id, _params) {
      try {
        // Get all tables with columns
        const columns = (await adminPrisma.$queryRaw`
          SELECT
            t.table_name,
            c.column_name,
            c.data_type,
            c.udt_name,
            c.is_nullable,
            c.column_default,
            c.character_maximum_length
          FROM information_schema.tables t
          JOIN information_schema.columns c
            ON t.table_name = c.table_name AND t.table_schema = c.table_schema
          WHERE t.table_schema = 'public'
            AND t.table_type = 'BASE TABLE'
          ORDER BY t.table_name, c.ordinal_position
        `) as Array<Record<string, unknown>>;

        // Get primary keys
        const pks = (await adminPrisma.$queryRaw`
          SELECT
            tc.table_name,
            kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
          WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = 'public'
        `) as Array<{ table_name: string; column_name: string }>;

        // Get foreign keys
        const fks = (await adminPrisma.$queryRaw`
          SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table,
            ccu.column_name AS foreign_column
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
        `) as Array<Record<string, string>>;

        // Get enums
        const enums = (await adminPrisma.$queryRaw`
          SELECT
            t.typname AS enum_name,
            e.enumlabel AS enum_value
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          JOIN pg_namespace n ON t.typnamespace = n.oid
          WHERE n.nspname = 'public'
          ORDER BY t.typname, e.enumsortorder
        `) as Array<{ enum_name: string; enum_value: string }>;

        // Get indexes
        const indexes = (await adminPrisma.$queryRaw`
          SELECT
            tablename,
            indexname,
            indexdef
          FROM pg_indexes
          WHERE schemaname = 'public'
          ORDER BY tablename, indexname
        `) as Array<Record<string, string>>;

        const result = {
          tables: columns,
          primaryKeys: pks,
          foreignKeys: fks,
          enums: enums,
          indexes: indexes,
        };

        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text", text: `error: ${msg}` }],
          details: { error: true },
        };
      }
    },
  });
}
