import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const isProduction = process.env.NODE_ENV === "production";
let dbUrl = process.env.DATABASE_URL;

// Add SSL mode for production databases (Render, etc.)
if (isProduction && !dbUrl.includes("sslmode=")) {
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
