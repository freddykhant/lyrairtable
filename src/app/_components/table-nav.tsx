"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { tables } from "~/server/db/schema";
import { api } from "~/trpc/react";

interface TableNavProps {
  tables: (typeof tables.$inferSelect)[];
  activeTableId: string;
  baseId: string;
}

export default function TableNav({
  tables,
  activeTableId,
  baseId,
}: TableNavProps) {
  const router = useRouter();
  const createTable = api.table.create.useMutation({
    onError: (error) => {
      console.error(error);
    },
  });

  const handleAddTable = async () => {
    await createTable.mutate({ name: "Untitled Table", baseId });
    router.refresh();
  };

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
      <div className="flex items-center gap-2">
        {tables.map((table) => (
          <button
            key={table.id}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              table.id === activeTableId
                ? "bg-white text-gray-900" // active
                : "text-gray-600 hover:bg-gray-100" // inactive
            }`}
          >
            {table.name}
            <ChevronDown size={14} className="text-gray-400" />
          </button>
        ))}
        <button
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          onClick={() => handleAddTable()}
        >
          <Plus size={14} />
          <span>Add</span>
        </button>
      </div>
    </nav>
  );
}
