import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { pgTableCreator } from "drizzle-orm/pg-core";

config({ path: ".env" });

// Recreate just the tables we need for seeding
const createTable = pgTableCreator((name) => `lyrairtable_${name}`);

const users = createTable("user", (d) => ({
  id: d.varchar({ length: 255 }).notNull().primaryKey(),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
}));

const bases = createTable("base", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }).notNull(),
  userId: d.varchar({ length: 255 }).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));

const tables = createTable("table", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }).notNull(),
  baseId: d.varchar({ length: 255 }).notNull(),
  order: d.integer().notNull().default(0),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));

const columns = createTable("column", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }).notNull(),
  tableId: d.varchar({ length: 255 }).notNull(),
  type: d.varchar({ length: 50 }).notNull(),
  order: d.integer().notNull().default(0),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));

const rows = createTable("row", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tableId: d.varchar({ length: 255 }).notNull(),
  data: d.jsonb().notNull(),
  order: d.integer().notNull().default(0),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));

const sql = neon(process.env.STORAGE_POSTGRES_URL!);
const db = drizzle({ client: sql });

const NUM_BASES = 3;
const NUM_TABLES_PER_BASE = 3;
const NUM_ROWS_PER_TABLE = 100; // Adjust up to 100k for performance testing

async function seed() {
  console.log("🌱 Starting database seed...");

  // Check if user exists
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    console.error("❌ No users found. Please log in first to create a user.");
    process.exit(1);
  }

  const userId = existingUsers[0]!.id;
  console.log(`✅ Using user ID: ${userId}`);

  // Create sample bases
  for (let i = 0; i < NUM_BASES; i++) {
    const baseNames = [
      "Marketing Campaigns",
      "Product Roadmap",
      "Sales Pipeline",
      "Customer Feedback",
      "Project Management",
      "Content Calendar",
    ];

    const [base] = await db
      .insert(bases)
      .values({
        name: baseNames[i] || faker.company.catchPhrase(),
        userId,
      })
      .returning();

    console.log(`📦 Created base: ${base!.name}`);

    // Create tables for each base
    for (let j = 0; j < NUM_TABLES_PER_BASE; j++) {
      const tableNames = [
        ["Campaigns", "Channels", "Analytics"],
        ["Features", "Releases", "Feedback"],
        ["Leads", "Deals", "Accounts"],
        ["Responses", "Categories", "Actions"],
        ["Tasks", "Sprints", "Team Members"],
        ["Posts", "Topics", "Schedule"],
      ];

      const [table] = await db
        .insert(tables)
        .values({
          name: tableNames[i]?.[j] || faker.commerce.department(),
          baseId: base!.id,
          order: j,
        })
        .returning();

      console.log(`  📋 Created table: ${table!.name}`);

      // Create columns for each table
      const columnConfigs = [
        { name: "Name", type: "text" },
        { name: "Status", type: "text" },
        { name: "Priority", type: "text" },
        { name: "Budget", type: "number" },
        { name: "Owner", type: "text" },
        { name: "Due Date", type: "text" },
        { name: "Progress", type: "number" },
        { name: "Notes", type: "text" },
      ];

      const createdColumns = [];
      for (let k = 0; k < columnConfigs.length; k++) {
        const [column] = await db
          .insert(columns)
          .values({
            name: columnConfigs[k]!.name,
            type: columnConfigs[k]!.type,
            tableId: table!.id,
            order: k,
          })
          .returning();
        createdColumns.push(column!);
      }

      console.log(`    🔤 Created ${createdColumns.length} columns`);

      // Create rows with data
      const rowsToInsert = [];
      for (let l = 0; l < NUM_ROWS_PER_TABLE; l++) {
        const rowData: Record<string, string | number> = {};

        for (const column of createdColumns) {
          if (column.type === "text") {
            switch (column.name) {
              case "Name":
                rowData[column.id] = faker.commerce.productName();
                break;
              case "Status":
                rowData[column.id] = faker.helpers.arrayElement([
                  "Not Started",
                  "In Progress",
                  "Completed",
                  "On Hold",
                ]);
                break;
              case "Priority":
                rowData[column.id] = faker.helpers.arrayElement([
                  "Low",
                  "Medium",
                  "High",
                  "Urgent",
                ]);
                break;
              case "Owner":
                rowData[column.id] = faker.person.fullName();
                break;
              case "Due Date":
                rowData[column.id] = faker.date
                  .future()
                  .toISOString()
                  .split("T")[0]!;
                break;
              case "Notes":
                rowData[column.id] = faker.lorem.sentence();
                break;
              default:
                rowData[column.id] = faker.lorem.words(3);
            }
          } else if (column.type === "number") {
            switch (column.name) {
              case "Budget":
                rowData[column.id] = faker.number.int({
                  min: 1000,
                  max: 100000,
                });
                break;
              case "Progress":
                rowData[column.id] = faker.number.int({ min: 0, max: 100 });
                break;
              default:
                rowData[column.id] = faker.number.int({ min: 0, max: 1000 });
            }
          }
        }

        rowsToInsert.push({
          tableId: table!.id,
          data: rowData,
          order: l,
        });
      }

      // Insert rows in batches for better performance
      const batchSize = 100;
      for (let m = 0; m < rowsToInsert.length; m += batchSize) {
        const batch = rowsToInsert.slice(m, m + batchSize);
        await db.insert(rows).values(batch);
      }

      console.log(`    ✨ Created ${NUM_ROWS_PER_TABLE} rows`);
    }
  }

  console.log("\n✅ Seed completed successfully!");
  console.log(`
Summary:
- ${NUM_BASES} bases created
- ${NUM_BASES * NUM_TABLES_PER_BASE} tables created
- ${NUM_BASES * NUM_TABLES_PER_BASE * 8} columns created
- ${NUM_BASES * NUM_TABLES_PER_BASE * NUM_ROWS_PER_TABLE} rows created
  `);
}

// Run the seed
seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
