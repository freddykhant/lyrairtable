import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { bases, tables, columns, rows, views } from "~/server/db/schema";
import { faker } from "@faker-js/faker";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const tableRouter = createTRPCRouter({
  // create new table
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        baseId: z.string(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const base = await ctx.db.query.bases.findFirst({
        where: eq(bases.id, input.baseId),
      });

      if (!base || base.userId !== ctx.session.user.id) {
        throw new Error("Base not found");
      }

      const [newTable] = await ctx.db
        .insert(tables)
        .values({
          name: input.name,
          baseId: input.baseId,
          order: input.order ?? 0,
        })
        .returning();

      if (!newTable) {
        throw new Error("Failed to create table");
      }

      // create default view
      const [defaultView] = await ctx.db
        .insert(views)
        .values({
          name: "Default View",
          tableId: newTable.id,
          config: {
            filters: [],
            sorts: [],
            hiddenColumns: [],
          },
        })
        .returning();

      if (!defaultView) {
        throw new Error("Failed to create default view");
      }

      // define default columns
      const defaultColumns = [
        { name: "Name", type: "text", order: 0, tableId: newTable.id },
        { name: "Status", type: "text", order: 1, tableId: newTable.id },
        { name: "Notes", type: "text", order: 2, tableId: newTable.id },
      ];

      // insert columns
      const createdColumns = await ctx.db
        .insert(columns)
        .values(defaultColumns)
        .returning();

      // create row data
      const defaultRows = [];
      for (let i = 0; i < 5; i++) {
        const rowData = {
          [createdColumns[0]!.id]: faker.person.fullName(), // name
          [createdColumns[1]!.id]: faker.helpers.arrayElement([
            "Not Started",
            "In Progress",
            "Done",
          ]), // status
          [createdColumns[2]!.id]: faker.lorem.sentence(), // notes
        };

        // insert row data
        defaultRows.push({
          tableId: newTable.id,
          data: rowData,
          order: i,
        });
      }

      // insert rows into table
      await ctx.db.insert(rows).values(defaultRows);

      return newTable;
    }),

  // get all tables for a base
  getByBaseId: protectedProcedure
    .input(z.object({ baseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const base = await ctx.db.query.bases.findFirst({
        where: eq(bases.id, input.baseId),
      });

      if (!base || base.userId !== ctx.session.user.id) {
        throw new Error("Base not found");
      }

      return await ctx.db.query.tables.findMany({
        where: eq(tables.baseId, input.baseId),
      });
    }),

  // get table by id
  getById: protectedProcedure
    .input(z.object({ baseId: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      const base = await ctx.db.query.bases.findFirst({
        where: eq(bases.id, input.baseId),
      });

      if (!base || base.userId !== ctx.session.user.id) {
        throw new Error("Base not found");
      }

      return await ctx.db.query.tables.findFirst({
        where: and(eq(tables.id, input.id), eq(tables.baseId, input.baseId)),
        with: {
          columns: {
            orderBy: (columns, { asc }) => [asc(columns.order)],
          },
        },
      });
    }),

  // update table
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        order: z.number().optional(),
        baseId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const base = await ctx.db.query.bases.findFirst({
        where: eq(bases.id, input.baseId),
      });

      if (!base || base.userId !== ctx.session.user.id) {
        throw new Error("Base not found");
      }

      const [updatedTable] = await ctx.db
        .update(tables)
        .set({
          name: input.name,
          order: input.order ?? 0,
        })
        .where(eq(tables.id, input.id))
        .returning();

      return updatedTable;
    }),

  // delete table
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const table = await ctx.db.query.tables.findFirst({
        where: eq(tables.id, input.id),
        with: {
          base: true,
        },
      });

      if (!table || table.base.userId !== ctx.session.user.id) {
        throw new Error("Table not found");
      }

      await ctx.db.delete(tables).where(eq(tables.id, input.id));

      return { success: true };
    }),
});
