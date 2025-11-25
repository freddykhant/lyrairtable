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
        <div className="p-4">
          <h1>Table Sidebar</h1>
        </div>
      )}
    </aside>
  );
}
