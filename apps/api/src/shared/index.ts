/**
 * @csv-crm/shared
 *
 * Single entry-point for all shared schemas and TypeScript types.
 * Both `apps/web` and `apps/api` import exclusively from this package —
 * never from each other — to ensure a clean dependency graph.
 */

// ─── Schemas ──────────────────────────────────────────────────────────────────
export * from "./schemas/crm-record.schema";
export * from "./schemas/api.schema";
