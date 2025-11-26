"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { tables } from "~/server/db/schema";
import { api } from "~/trpc/react";

interface TableNavProps {
  tables: (typeof tables.$inferSelect)[];
  activeTableId: string;
  baseId: string;
  onTableChange: (tableId: string) => void;
}

export default function TableNav({
  tables,
  activeTableId,
  baseId,
  onTableChange,
}: TableNavProps) {
  const [editingTitle, setEditingTitle] = useState<{
    tableId: string;
  } | null>(null);
  const [editedTableName, setEditedTableName] = useState<string>("");

  const router = useRouter();
  const utils = api.useUtils();

  const createTable = api.table.create.useMutation({
    onError: (error) => {
      console.error(error);
    },
  });

  const updateTable = api.table.update.useMutation({
    onSuccess: () => {
      utils.base.getById.invalidate();
    },
  });

  // table handlers
  const handleAddTable = async () => {
    await createTable.mutate({ name: "Untitled Table", baseId });
    router.refresh();
  };

  const handleTableClick = (tableId: string, currentName: string) => {
    setEditingTitle({ tableId });
    setEditedTableName(currentName);
  };

  const handleTableSave = (tableId: string) => {
    if (!editingTitle || !editedTableName.trim()) {
      handleTableCancel();
      return;
    }

    updateTable.mutate({ id: tableId, name: editedTableName, baseId });
    setEditingTitle(null);
  };

  const handleTableCancel = () => {
    setEditingTitle(null);
    setEditedTableName("");
  };

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm">
      <div className="flex items-center gap-2">
        {tables.map((table) => {
          const isEditingTable = editingTitle?.tableId === table.id;

          return (
            <div
              key={table.id}
              className={`flex items-center gap-2 rounded-lg px-3 py-1 transition-colors ${
                table.id === activeTableId
                  ? "bg-white text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {isEditingTable ? (
                <input
                  autoFocus
                  value={editedTableName}
                  onChange={(e) => setEditedTableName(e.target.value)}
                  onBlur={() => handleTableSave(table.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleTableSave(table.id);
                    } else if (e.key === "Escape") {
                      handleTableCancel();
                    }
                  }}
                  className="-mx-1 border-none bg-transparent px-1 outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <button
                  onClick={() => onTableChange(table.id)}
                  onDoubleClick={() => handleTableClick(table.id, table.name)}
                  className="flex items-center gap-2"
                >
                  {table.name}
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
              )}
            </div>
          );
        })}
        <button
          className="flex items-center gap-2 rounded-md px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
          onClick={() => handleAddTable()}
        >
          <Plus size={14} />
          <span>Add</span>
        </button>
      </div>
    </nav>
  );
}
