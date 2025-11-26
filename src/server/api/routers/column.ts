import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { columns, tables } from "~/server/db/schema";

export const columnRouter = createTRPCRouter({
  // create new column
  create: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        name: z.string().min(1),
        type: z.enum(["text", "number"]),
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

      const [newColumn] = await ctx.db
        .insert(columns)
        .values({
          name: input.name,
          type: input.type,
          tableId: input.tableId,
          order: input.order ?? 0,
        })
        .returning();

      return newColumn;
    }),

  // get columns by tableId
  getByTableId: protectedProcedure
    .input(z.object({ tableId: z.string() }))
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

      return await ctx.db.query.columns.findMany({
        where: eq(columns.tableId, input.tableId),
        orderBy: (columns, { asc }) => [asc(columns.order)],
      });
    }),

  // update column
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const column = await ctx.db.query.columns.findFirst({
        where: eq(columns.id, input.id),
        with: {
          table: {
            with: {
              base: true,
            },
          },
        },
      });

      if (!column || column.table.base.userId !== ctx.session.user.id) {
        throw new Error("Column not found");
      }

      const [updatedColumn] = await ctx.db
        .update(columns)
        .set({
          name: input.name,
          order: input.order ?? column.order,
        })
        .where(eq(columns.id, input.id))
        .returning();

      return updatedColumn;
    }),

  // delete column
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const column = await ctx.db.query.columns.findFirst({
        where: eq(columns.id, input.id),
        with: {
          table: {
            with: {
              base: true,
            },
          },
        },
      });

      if (!column || column.table.base.userId !== ctx.session.user.id) {
        throw new Error("Column not found");
      }

      const [deletedColumn] = await ctx.db
        .delete(columns)
        .where(eq(columns.id, input.id))
        .returning();

      return deletedColumn;
    }),
});
