import { useState } from "react";
import { api } from "~/trpc/react";
import type { columns, rows } from "~/server/db/schema";

interface UseTableHandlersProps {
  tableId: string;
  columns: (typeof columns.$inferSelect)[];
  rows: (typeof rows.$inferSelect)[];
  onRowUpdate: (rowId: string, updatedData: Record<string, string>) => void;
  activeViewId: string;
  currentSorts: Array<{ columnId: string; direction: "asc" | "desc" }>;
  onUpdateSort: (columnId: string, direction: "asc" | "desc") => void;
}

export function useTableHandlers({
  tableId,
  columns,
  rows,
  onRowUpdate,
  activeViewId,
  onUpdateSort,
}: UseTableHandlersProps) {
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);
  const [editedValue, setEditedValue] = useState<string>("");
  const [selectedCell, setSelectedCell] = useState<{
    rowIndex: number;
    columnIndex: number;
  } | null>(null);
  const [addColumnDropdownOpen, setAddColumnDropdownOpen] = useState(false);
  const [sortDropdownColumn, setSortDropdownColumn] = useState<string | null>(
    null,
  );

  const utils = api.useUtils();

  const createRow = api.row.create.useMutation({
    onSuccess: () => {
      utils.row.getByTableId.invalidate({ tableId });
    },
  });

  const updateRow = api.row.update.useMutation({
    // no cache invalidation - using optimistic updates
  });

  const createColumn = api.column.create.useMutation({
    onSuccess: () => {
      utils.table.getById.invalidate();
    },
  });

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

    const originalRow = rows.find((r) => r.id === rowId);
    if (!originalRow) return;

    const updatedData = {
      ...(originalRow.data as Record<string, string>),
      [editingCell.columnId]: editedValue,
    };

    // optimistic update
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
  const handleAddColumn = (type: "text" | "number") => {
    createColumn.mutate({
      tableId: tableId,
      name: type === "text" ? "Text" : "Number",
      type: type,
      order: columns.length,
    });
    setAddColumnDropdownOpen(false);
  };

  // sort handler
  const handleSort = (columnId: string, direction: "asc" | "desc") => {
    if (!activeViewId) return;

    onUpdateSort(columnId, direction);
    setSortDropdownColumn(null); // close dropdown
  };

  // toggle column dropdown
  const toggleColumnDropdown = () => {
    setAddColumnDropdownOpen(!addColumnDropdownOpen);
  };

  // handle keyboard navigation
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

  return {
    // state
    editingCell,
    editedValue,
    selectedCell,
    setEditedValue,
    setSelectedCell,
    // handlers
    handleAddRow,
    handleCellClick,
    handleSave,
    handleCancel,
    handleAddColumn,
    handleKeyDown,
    toggleColumnDropdown,
    addColumnDropdownOpen,
    sortDropdownColumn,
    setSortDropdownColumn,
    handleSort,
  };
}
