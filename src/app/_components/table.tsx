"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import type { columns, rows } from "~/server/db/schema";

interface TableProps {
  columns: (typeof columns.$inferSelect)[];
  rows: (typeof rows.$inferSelect)[];
  isLoading: boolean;
}

export default function Table({ columns, rows, isLoading }: TableProps) {
  if (isLoading) {
    return <div className="p-4 text-gray-500"> Loading...</div>;
  }
  if (!columns.length) {
    return <div className="p-4 text-gray-500"> No columns found</div>;
  }

  const tanstackColumns = columns.map((col) => ({
    accessorKey: col.id,
    header: col.name,
    id: col.id,
  }));

  const tanstackRows = rows.map((row) => ({
    id: row.id,
    ...(row.data as Record<string, unknown>),
  }));

  const table = useReactTable({
    columns: tanstackColumns,
    data: tanstackRows,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-full w-full overflow-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-gray-50">
          {/* table header */}
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border-r border-b border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {/* body */}
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border-r border-b border-gray-200 px-4 py-2 text-sm text-gray-900"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* footer for record count */}
      <div className="border-t border-gray-200 p-2 text-xs text-gray-500">
        {rows.length} records
      </div>
    </div>
  );
}
