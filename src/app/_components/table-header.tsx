"use client";

import { Loader2, Menu, Plus, EyeOff } from "lucide-react";
import type { columns } from "~/server/db/schema";

interface TableHeaderProps {
  onToggleSidebar: () => void;
  onAddRows: () => void;
  isLoading: boolean;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchTerm: string;
  columns: (typeof columns.$inferSelect)[];
  hiddenColumns: string[];
  onToggleHideColumns: () => void;
  hideColumnsOpen: boolean;
  onToggleColumn: (columnId: string) => void;
  onHideAll: () => void;
  onShowAll: () => void;
}

export default function TableHeader({
  onToggleSidebar,
  onAddRows,
  isLoading,
  onSearch,
  searchTerm,
  columns,
  hiddenColumns,
  onToggleHideColumns,
  hideColumnsOpen,
  onToggleColumn,
  onHideAll,
  onShowAll,
}: TableHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      {/* sidebar toggle button */}
      <button
        onClick={onToggleSidebar}
        className="rounded p-1.5 transition-colors hover:cursor-pointer hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>
      <div className="relative flex items-center gap-2">
        {/* hide fields modal */}
        {hideColumnsOpen && (
          <div className="absolute top-full right-4 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <EyeOff size={16} />
                <span>Hide fields</span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {columns.map((column) => {
                const isHidden = hiddenColumns.includes(column.id);

                return (
                  <button
                    key={column.id}
                    onClick={() => onToggleColumn(column.id)}
                    className="flex w-full items-center gap-3 rounded px-3 py-2 hover:bg-gray-50"
                  >
                    {/* toggle switch */}
                    <div
                      className={`h-5 w-9 rounded-full transition-colors ${
                        isHidden ? "bg-gray-300" : "bg-green-500"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          isHidden ? "translate-x-0" : "translate-x-4"
                        }`}
                      />
                    </div>

                    <span className="text-sm text-gray-700">{column.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 border-t border-gray-200 p-3">
              <button
                onClick={onHideAll}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                Hide all
              </button>
              <button
                onClick={onShowAll}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                Show all
              </button>
            </div>
          </div>
        )}
        {/* hide fields button */}
        <button
          onClick={onToggleHideColumns}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:cursor-pointer hover:bg-gray-50"
        >
          <EyeOff size={16} />
          <span>Hide fields</span>
        </button>
        {/* search input */}
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={onSearch}
          className="w-48 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
        />

        {/* add 100k rows button */}
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
