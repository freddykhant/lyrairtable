"use client";

import { Loader2, Menu, Plus } from "lucide-react";

interface TableHeaderProps {
  onToggleSidebar: () => void;
  onAddRows: () => void;
  isLoading: boolean;
}

export default function TableHeader({
  onToggleSidebar,
  onAddRows,
  isLoading,
}: TableHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      <button
        onClick={onToggleSidebar}
        className="rounded p-1.5 transition-colors hover:cursor-pointer hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>
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
    </header>
  );
}
