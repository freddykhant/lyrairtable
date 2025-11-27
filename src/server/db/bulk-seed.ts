import { db } from "./index";
import { rows, columns as columnsTable, tables } from "./schema";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

export async function bulkSeed(tableId: string, count: number = 100000) {
  console.log(`🌱 seeding ${count} rows for table ${tableId}...`);

  // get table columns
  const tableColumns = await db.query.columns.findMany({
    where: eq(columnsTable.tableId, tableId),
    orderBy: (columns, { asc }) => [asc(columns.order)],
  });

  if (tableColumns.length === 0) {
    throw new Error("No columns found for table");
  }

  // batch insert (1k at a time)
  const batchSize = 1000;
  const totalBatches = Math.ceil(count / batchSize);

  // loop through batches
  for (let batch = 0; batch < totalBatches; batch++) {
    const batchRows = [];
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, count);

    // loop through batch
    for (let i = batchStart; i < batchEnd; i++) {
      const rowData: Record<string, string> = {};

      // generate fake data for each column
      tableColumns.forEach((col) => {
        if (col.type === "text") {
          rowData[col.id] = faker.person.fullName();
        } else if (col.type === "number") {
          rowData[col.id] = faker.number.int({ min: 0, max: 1000 }).toString();
        }
      });

      // insert row data
      batchRows.push({
        tableId,
        data: rowData,
        order: i,
      });
    }

    // insert batch rows
    await db.insert(rows).values(batchRows);
    console.log(`✅ batch ${batch + 1}/${totalBatches} complete`);
  }

  console.log(`🎉 seeded ${count} rows!`);
}
