import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { pgTableCreator } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

config({ path: ".env" });

// Recreate the table creator
const createTable = pgTableCreator((name) => `airtable_${name}`);

// Define minimal table structures (just need the names)
const views = createTable("view", (d) => ({
  id: d.varchar({ length: 255 }).notNull().primaryKey(),
}));

const rows = createTable("row", (d) => ({
  id: d.varchar({ length: 255 }).notNull().primaryKey(),
}));

const columns = createTable("column", (d) => ({
  id: d.varchar({ length: 255 }).notNull().primaryKey(),
}));

const tables = createTable("table", (d) => ({
  id: d.varchar({ length: 255 }).notNull().primaryKey(),
}));

const bases = createTable("base", (d) => ({
  id: d.varchar({ length: 255 }).notNull().primaryKey(),
}));

// Note: We don't delete from auth tables (users, accounts, sessions)
// to preserve your Google OAuth login

const sqlClient = neon(process.env.STORAGE_POSTGRES_URL!);
const db = drizzle({ client: sqlClient });

async function clearDatabase() {
  console.log("🧹 Clearing database...");
  console.log("Note: User accounts will be preserved for authentication\n");

  try {
    // Delete in order of dependencies (child → parent)
    console.log("Deleting views...");
    await db.delete(views);

    console.log("Deleting rows...");
    await db.delete(rows);

    console.log("Deleting columns...");
    await db.delete(columns);

    console.log("Deleting tables...");
    await db.delete(tables);

    console.log("Deleting bases...");
    await db.delete(bases);

    console.log("\n✅ Database cleared successfully!");
    console.log(
      "Your user account is still intact - you can log in and start fresh.",
    );
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
}

// Run the clear
clearDatabase()
  .catch((error) => {
    console.error("❌ Clear failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
