import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

let dbUrl = process.env.DATABASE_URL;

// Always add SSL mode for database connections
if (!dbUrl.includes("sslmode=")) {
  dbUrl += dbUrl.includes("?") ? "&sslmode=require" : "?sslmode=require";
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
