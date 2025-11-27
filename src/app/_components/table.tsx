"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useState, useRef, useEffect } from "react";
import type { columns, rows } from "~/server/db/schema";
import { api } from "~/trpc/react";
import { Plus } from "lucide-react";

interface TableProps {
  tableId: string;
  columns: (typeof columns.$inferSelect)[];
  rows: (typeof rows.$inferSelect)[];
  totalRows: number;
  isLoading: boolean;
}

export default function Table({
  tableId,
  columns,
  rows,
  totalRows,
  isLoading,
}: TableProps) {
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);
  const [editedValue, setEditedValue] = useState<string>("");

  // ref for scrollable container
  const parentRef = useRef<HTMLDivElement>(null);

  const utils = api.useUtils();

  const createRow = api.row.create.useMutation({
    onSuccess: () => {
      utils.row.getByTableId.invalidate({ tableId });
    },
  });

  const updateRow = api.row.update.useMutation({
    onSuccess: () => {
      utils.row.getByTableId.invalidate({ tableId });
    },
  });

  const createColumn = api.column.create.useMutation({
    onSuccess: () => {
      utils.table.getById.invalidate();
    },
  });

  const tanstackColumns = useMemo(
    () =>
      columns.map((col) => ({
        accessorKey: col.id,
        header: col.name,
        id: col.id,
        cell: (info: any) => {
          const value = info.getValue() as string;
          const rowId = info.row.original.id;
          const columnId = col.id;
          const isEditing =
            editingCell?.rowId === rowId && editingCell?.columnId === columnId;

          if (isEditing) {
            return (
              <input
                autoFocus
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                onBlur={() => handleSave(rowId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSave(rowId);
                  } else if (e.key === "Escape") {
                    handleCancel();
                  }
                }}
                className="-mx-1 w-full border-none bg-transparent px-1 outline-none focus:ring-2 focus:ring-blue-500"
              />
            );
          }

          return (
            <div
              onClick={() => handleCellClick(rowId, columnId, value)}
              className="h-full w-full cursor-text"
            >
              {value || (
                <span className="inline-block h-5 w-full text-gray-300">
                  &nbsp;
                </span>
              )}
            </div>
          );
        },
      })),
    [columns, editingCell, editedValue],
  );

  const tanstackRows = useMemo(
    () =>
      rows.map((row) => ({
        id: row.id,
        ...(row.data as Record<string, string>),
      })),
    [rows],
  );

  const table = useReactTable({
    columns: tanstackColumns,
    data: tanstackRows,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: totalRows, // total rows in db
    getScrollElement: () => parentRef.current, // scrollable container
    estimateSize: () => 35, // estimated row heightin px
    overscan: 10, // render 10 extra rows above/below viewport
  });

  if (isLoading) {
    return <div className="p-4 text-gray-500"> Loading...</div>;
  }
  if (!columns.length) {
    return <div className="p-4 text-gray-500"> No columns found</div>;
  }

  // row handlers
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

  // cell handlers
  const handleCellClick = (
    rowId: string,
    columnId: string,
    currentValue: string,
  ) => {
    setEditingCell({ rowId, columnId });
    setEditedValue(currentValue || "");
  };

  const handleSave = (rowId: string) => {
    if (!editingCell) return;

    // find the original row data
    const originalRow = rows.find((r) => r.id === rowId);
    if (!originalRow) return;

    // merge the edited value into the row's JSONB data
    const updatedData = {
      ...(originalRow.data as Record<string, string>),
      [editingCell.columnId]: editedValue,
    };

    updateRow.mutate({
      id: rowId,
      data: updatedData,
    });

    setEditingCell(null);
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditedValue("");
  };

  // column handlers
  const handleAddColumn = () => {
    createColumn.mutate({
      tableId: tableId,
      name: "New Column",
      type: "text",
      order: columns.length,
    });
  };

  return (
    <div ref={parentRef} className="h-full w-full overflow-auto">
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
              <th className="border-b border-gray-200 px-4 py-2">
                <button
                  onClick={handleAddColumn}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                >
                  <Plus size={14} />
                </button>
              </th>
            </tr>
          ))}
        </thead>

        {/* body */}
        <tbody
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index];
            if (!row) return null;

            return (
              <tr
                key={row.id}
                className="hover:bg-gray-50"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-r border-b border-gray-200 px-4 py-1.5 text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
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
