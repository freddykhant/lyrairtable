import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { bulkSeed } from "~/server/db/bulk-seed";
import { tables } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const bulkRouter = createTRPCRouter({
  seedRows: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        count: z.number().min(1).max(100000).default(100000),
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

      await bulkSeed(input.tableId, input.count);

      return { success: true, count: input.count };
    }),
});
