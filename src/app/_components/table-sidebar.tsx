import { Plus, LayoutGrid } from "lucide-react";

interface TableSidebarProps {
  isOpen: boolean;
}

export default function TableSidebar({ isOpen }: TableSidebarProps) {
  return (
    <aside
      className={`border-r border-gray-200 bg-white text-sm transition-all ${
        isOpen ? "w-64" : "w-0"
      }`}
    >
      {isOpen && (
        <div className="flex flex-col space-y-1 p-3">
          <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100">
            <Plus size={16} />
            <span>Create new...</span>
          </button>

          <div className="my-2 border-t border-gray-200" />

          <button className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900">
            <LayoutGrid size={16} className="text-blue-600" />
            <span>Grid view</span>
          </button>
        </div>
      )}
    </aside>
  );
}
