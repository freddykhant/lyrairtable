import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { views, tables } from "~/server/db/schema";

export const viewRouter = createTRPCRouter({
  // get all views for a table
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

      return await ctx.db.query.views.findMany({
        where: eq(views.tableId, input.tableId),
      });
    }),

  // create view
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        tableId: z.string(),
        config: z.object({
          filters: z.array(z.any()).optional(),
          sorts: z.array(z.any()).optional(),
        }),
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

      const [newView] = await ctx.db
        .insert(views)
        .values({
          name: input.name,
          tableId: input.tableId,
          config: input.config,
        })
        .returning();

      return newView;
    }),
});
