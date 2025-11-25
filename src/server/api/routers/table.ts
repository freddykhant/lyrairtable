import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { bases, tables, columns, rows } from "~/server/db/schema";
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
      });
    }),
});
