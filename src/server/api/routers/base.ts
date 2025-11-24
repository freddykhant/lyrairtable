import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { bases } from "~/server/db/schema";
import { create } from "domain";

export const baseRouter = createTRPCRouter({
  // create new base
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [newBase] = await ctx.db
        .insert(bases)
        .values({
          name: input.name,
          userId: ctx.session.user.id,
        })
        .returning();

      return newBase;
    }),

  // get all bases for current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.bases.findMany({
      where: eq(bases.userId, ctx.session.user.id),
      orderBy: desc(bases.createdAt),
    });
  }),

  // get (single) base by id
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const base = await ctx.db.query.bases.findFirst({
        where: eq(bases.id, input.id),
      });

      if (!base || base.userId !== ctx.session.user.id) {
        throw new Error("Base not found");
      }

      return base;
    }),
});
