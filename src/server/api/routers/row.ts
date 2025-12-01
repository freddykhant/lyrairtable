import { z } from "zod";
import { eq, asc, sql } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { rows, tables } from "~/server/db/schema";

export const rowRouter = createTRPCRouter({
  // create new row
  create: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        data: z.record(z.string(), z.any()),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const table = await ctx.db.query.tables.findFirst({
        where: eq(tables.id, input.tableId),
        with: {
          base: true,
        },
      });

      if (!table || table.base.userId !== ctx.session.user.id) {
        throw new Error("Table not found");
      }

      const [newRow] = await ctx.db
        .insert(rows)
        .values({
          tableId: input.tableId,
          data: input.data,
          order: input.order ?? 0,
        })
        .returning();

      return newRow;
    }),

  // get rows by tableId
  getByTableId: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        limit: z.number().min(1).max(1000).default(50),
        offset: z.number().min(0).default(0),
        searchTerm: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const table = await ctx.db.query.tables.findFirst({
        where: eq(tables.id, input.tableId),
        with: {
          base: true,
        },
      });

      if (!table || table.base.userId !== ctx.session.user.id) {
        throw new Error("Table not found");
      }

      let whereClause = eq(rows.tableId, input.tableId);

      // convert JSONB to text + use case insensitive search
      if (input.searchTerm && input.searchTerm.trim() !== "") {
        whereClause = sql`${rows.tableId} = ${input.tableId} AND ${rows.data}::text ILIKE ${`%${input.searchTerm}%`}`;
      }

      // fetch rows
      const tableRows = await ctx.db
        .select()
        .from(rows)
        .where(whereClause)
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(asc(rows.order));

      // get total count with same filter
      const [{ count } = { count: 0 }] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(rows)
        .where(whereClause);

      return {
        rows: tableRows,
        total: count,
      };
    }),

  // update row
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.record(z.string(), z.any()),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.query.rows.findFirst({
        where: eq(rows.id, input.id),
        with: {
          table: {
            with: {
              base: true,
            },
          },
        },
      });

      if (!row || row.table.base.userId !== ctx.session.user.id) {
        throw new Error("Row not found");
      }

      const [updatedRow] = await ctx.db
        .update(rows)
        .set({
          data: input.data,
          order: input.order ?? row.order,
        })
        .where(eq(rows.id, input.id))
        .returning();

      return updatedRow;
    }),

  // delete row
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.query.rows.findFirst({
        where: eq(rows.id, input.id),
        with: {
          table: {
            with: {
              base: true,
            },
          },
        },
      });

      if (!row || row.table.base.userId !== ctx.session.user.id) {
        throw new Error("Row not found");
      }

      const [deletedRow] = await ctx.db
        .delete(rows)
        .where(eq(rows.id, input.id))
        .returning();

      return deletedRow;
    }),
});
