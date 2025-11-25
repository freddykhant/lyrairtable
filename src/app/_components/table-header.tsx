"use client";

import { Search, Menu, Table } from "lucide-react";

interface TableHeaderProps {
  onToggleSidebar: () => void;
}

export default function TableHeader({ onToggleSidebar }: TableHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      <button
        onClick={onToggleSidebar}
        className="rounded p-1.5 transition-colors hover:cursor-pointer hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>
    </header>
  );
}
