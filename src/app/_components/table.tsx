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
  onFetchMore: () => void;
  onRowUpdate: (rowId: string, updatedData: Record<string, string>) => void;
}

export default function Table({
  tableId,
  columns,
  rows,
  totalRows,
  isLoading,
  onFetchMore,
  onRowUpdate,
}: TableProps) {
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);
  const [editedValue, setEditedValue] = useState<string>("");

  const [selectedCell, setSelectedCell] = useState<{
    rowIndex: number;
    columnIndex: number;
  } | null>(null);

  // ref for scrollable container
  const parentRef = useRef<HTMLDivElement>(null);

  const utils = api.useUtils();

  const createRow = api.row.create.useMutation({
    onSuccess: () => {
      utils.row.getByTableId.invalidate({ tableId });
    },
  });

  const updateRow = api.row.update.useMutation({
    // no cache invalidation needed - we're just updating local state
    // the parent component's `allRows` will naturally show the updated value
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
        size: 200,
        cell: (info: any) => {
          const value = info.getValue() as string;
          const rowId = info.row.original.id;
          const columnId = col.id;
          const rowIndex = info.row.index;
          const columnIndex = columns.findIndex((c) => c.id === columnId);

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
                    e.stopPropagation(); // prevent keyboard nav from catching this
                    handleSave(rowId);
                  } else if (e.key === "Escape") {
                    e.stopPropagation();
                    handleCancel();
                  }
                }}
                className="-mx-1 w-full border-none bg-transparent px-1 outline-none"
              />
            );
          }

          return (
            <div
              onClick={() => setSelectedCell({ rowIndex, columnIndex })}
              onDoubleClick={() => handleCellClick(rowId, columnId, value)}
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

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    if (!virtualItems.length) return;

    // get last visible row
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    // if near end of loaded rows, fetch more
    // threshold: when last visible row is within 20 rows of what's loaded
    if (lastItem.index >= rows.length - 20 && rows.length < totalRows) {
      onFetchMore();
    }
  }, [rowVirtualizer.getVirtualItems(), rows.length, totalRows, onFetchMore]);

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

    // update parent state immediately (optimistic update)
    onRowUpdate(rowId, updatedData);

    // save to database
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

  // keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;

    const { rowIndex, columnIndex } = selectedCell;
    const maxRowIndex = rows.length - 1;
    const maxColIndex = columns.length - 1;

    let newRowIndex = rowIndex;
    let newColIndex = columnIndex;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        newRowIndex = Math.max(0, rowIndex - 1);
        break;
      case "ArrowDown":
        e.preventDefault();
        newRowIndex = Math.min(maxRowIndex, rowIndex + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        newColIndex = Math.max(0, columnIndex - 1);
        break;
      case "ArrowRight":
      case "Tab":
        e.preventDefault();
        newColIndex = Math.min(maxColIndex, columnIndex + 1);
        break;
      case "Enter":
        e.preventDefault();
        // start editing the selected cell
        const row = rows[rowIndex];
        const column = columns[columnIndex];
        if (row && column) {
          handleCellClick(
            row.id,
            column.id,
            (row.data as Record<string, string>)[column.id] || "",
          );
        }
        break;
      default:
        return;
    }

    setSelectedCell({ rowIndex: newRowIndex, columnIndex: newColIndex });
  };

  return (
    <div
      ref={parentRef}
      className="h-full w-full overflow-auto outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <table className="w-full">
        <thead
          className="sticky top-0 z-10 bg-gray-50"
          style={{ display: "block" }}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              style={{ display: "flex" }}
              className="border-b border-gray-200"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    width: header.getSize(),
                    minWidth: header.getSize(),
                    display: "block",
                  }}
                  className="border-r border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
              <th
                className="border-gray-200 px-4 py-2"
                style={{ display: "block" }}
              >
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

        <tbody
          style={{
            display: "block",
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
                  display: "flex",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                  height: `${virtualRow.size}px`,
                }}
              >
                {row.getVisibleCells().map((cell, colIndex) => {
                  const isSelected =
                    selectedCell?.rowIndex === virtualRow.index &&
                    selectedCell?.columnIndex === colIndex;

                  const rowData = row.original as {
                    id: string;
                    [key: string]: unknown;
                  };
                  const columnId = cell.column.id;
                  const value = (rowData[columnId] as string) || "";

                  return (
                    <td
                      key={cell.id}
                      style={{
                        display: "block",
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "text",
                        ...(isSelected
                          ? { boxShadow: "inset 0 0 0 2px #3b82f6" }
                          : {}),
                      }}
                      className="border-r border-b border-gray-200 px-4 py-1.5 text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>

        <tfoot
          style={{ display: "block" }}
          className="border-t border-gray-200"
        >
          <tr
            onClick={handleAddRow}
            style={{ display: "flex" }}
            className="group cursor-pointer hover:bg-gray-50"
          >
            <td
              className="border-b border-gray-200 px-3 py-2.5 text-sm text-gray-400"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Plus size={16} className="text-gray-400" />
            </td>
          </tr>
          <tr style={{ display: "block" }}>
            <td
              className="px-4 py-2 text-left text-xs font-medium text-gray-700"
              style={{ display: "block" }}
            >
              {totalRows.toLocaleString()} records
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
