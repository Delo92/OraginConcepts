import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enable SSL for production OR external databases (Render, Neon, Supabase, etc.)
const dbUrl = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === "production";
const isExternalDb = dbUrl.includes("render.com") || 
                     dbUrl.includes("neon.tech") || 
                     dbUrl.includes("supabase.") ||
                     dbUrl.includes("sslmode=require");
const useSSL = isProduction || isExternalDb;

export const pool = new Pool({ 
  connectionString: dbUrl,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});
export const db = drizzle(pool, { schema });
