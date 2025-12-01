"use client";

import { Loader2, Menu, Plus } from "lucide-react";
import type { columns } from "~/server/db/schema";

interface TableHeaderProps {
  onToggleSidebar: () => void;
  onAddRows: () => void;
  isLoading: boolean;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchTerm: string;
  columns: (typeof columns.$inferSelect)[];
  hiddenColumns: string[];
  activeViewId: string;
  tableId: string;
}

export default function TableHeader({
  onToggleSidebar,
  onAddRows,
  isLoading,
  onSearch,
  searchTerm,
  columns,
  hiddenColumns,
  activeViewId,
  tableId,
}: TableHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      <button
        onClick={onToggleSidebar}
        className="rounded p-1.5 transition-colors hover:cursor-pointer hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={onSearch}
          className="w-48 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
        />
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin text-gray-600" />
            <span className="text-sm text-gray-600">Adding rows...</span>
          </div>
        ) : (
          <button
            onClick={onAddRows}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 p-1 text-sm font-medium text-white transition-opacity hover:bg-blue-700"
          >
            <Plus size={18} />
            <span>100k Rows</span>
          </button>
        )}
      </div>
    </header>
  );
}
