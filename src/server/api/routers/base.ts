import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { bases, tables, columns, rows } from "~/server/db/schema";
import { faker } from "@faker-js/faker";

export const baseRouter = createTRPCRouter({
  // create new base
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )

    .mutation(async ({ ctx, input }) => {
      // create the base
      const [newBase] = await ctx.db
        .insert(bases)
        .values({
          name: input.name,
          userId: ctx.session.user.id,
        })
        .returning();

      const [newTable] = await ctx.db
        .insert(tables)
        .values({
          name: "Table 1",
          baseId: newBase!.id,
          order: 0,
        })
        .returning();

      // create default columns
      const defaultColumns = [
        { name: "Name", type: "text", order: 0, tableId: newTable!.id },
        { name: "Status", type: "text", order: 1, tableId: newTable!.id },
        { name: "Notes", type: "text", order: 2, tableId: newTable!.id },
      ];

      // insert columns
      const createdColumns = await ctx.db
        .insert(columns)
        .values(defaultColumns)
        .returning();

      // create default rows
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

        defaultRows.push({
          tableId: newTable!.id,
          data: rowData,
          order: i,
        });
      }

      // insert rows into table
      await ctx.db.insert(rows).values(defaultRows);

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
        with: {
          tables: true,
        },
      });

      if (!base || base.userId !== ctx.session.user.id) {
        throw new Error("Base not found");
      }

      return base;
    }),
});
