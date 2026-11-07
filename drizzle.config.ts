import { defineConfig } from "drizzle-kit";

// amdedat pattern: `npm run db:generate` / `npm run db:migrate` pick this up from
// the repo root. DATABASE_URL is read lazily by drizzle-kit at command time.
export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgres://midspot:midspot@127.0.0.1:5433/midspot",
  },
  strict: true,
  verbose: true,
});
