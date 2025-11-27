import { z } from "zod";
import { eq, asc } from "drizzle-orm";

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

      return await ctx.db.query.rows.findMany({
        where: eq(rows.tableId, input.tableId),
        limit: input.limit,
        offset: input.offset,
        orderBy: (rows, { asc }) => [asc(rows.order)],
      });
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
