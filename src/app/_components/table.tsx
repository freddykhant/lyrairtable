"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useMemo } from "react";
import type { columns, rows } from "~/server/db/schema";
import { api } from "~/trpc/react";
import { Plus } from "lucide-react";

interface TableProps {
  tableId: string;
  columns: (typeof columns.$inferSelect)[];
  rows: (typeof rows.$inferSelect)[];
  isLoading: boolean;
}

export default function Table({
  tableId,
  columns,
  rows,
  isLoading,
}: TableProps) {
  if (isLoading) {
    return <div className="p-4 text-gray-500"> Loading...</div>;
  }
  if (!columns.length) {
    return <div className="p-4 text-gray-500"> No columns found</div>;
  }

  const tanstackColumns = useMemo(
    () =>
      columns.map((col) => ({
        accessorKey: col.id,
        header: col.name,
        id: col.id,
        cell: (info: any) => {
          const value = info.getValue();
          return (
            value || <span className="inline-block h-5 w-full">&nbsp;</span>
          );
        },
      })),
    [columns],
  );

  const tanstackRows = useMemo(
    () =>
      rows.map((row) => ({
        id: row.id,
        ...(row.data as Record<string, string>),
      })),
    [rows],
  );

  const utils = api.useUtils();
  const createRow = api.row.create.useMutation({
    onSuccess: () => {
      utils.row.getByTableId.invalidate({ tableId });
    },
  });

  const handleAddRow = () => {
    const emptyData: Record<string, string> = {};
    columns.forEach((col) => {
      emptyData[col.id] = "";
    });

    createRow.mutate({
      tableId: tableId,
      data: emptyData,
      order: rows.length,
    });
  };

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
                  className="border-r border-b border-gray-200 px-4 py-1.5 text-sm text-gray-900"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr
            onClick={handleAddRow}
            className="group cursor-pointer hover:bg-gray-50"
          >
            <td
              colSpan={columns.length}
              className="border-r border-b border-gray-200 px-3 py-2.5 text-sm text-gray-400"
            >
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-gray-400" />
              </div>
            </td>
          </tr>
          <tr>
            <td
              colSpan={table.getAllColumns().length}
              className="border-t border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700"
            >
              {rows.length} records
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
