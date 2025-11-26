"use client";

import { ChevronDown, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { api } from "~/trpc/react";

interface BaseHeaderProps {
  baseId: string;
  baseName: string;
}

export default function BaseHeader({ baseName, baseId }: BaseHeaderProps) {
  const [editingBaseName, setEditingBaseName] = useState<{
    baseId: string;
  } | null>(null);
  const [editedBaseName, setEditedBaseName] = useState<string>("");

  const utils = api.useUtils();

  const updateBase = api.base.update.useMutation({
    onSuccess: () => {
      utils.base.getById.invalidate();
    },
  });

  const handleBaseNameClick = (baseId: string, currentName: string) => {
    setEditingBaseName({ baseId });
    setEditedBaseName(currentName);
  };

  const handleBaseNameSave = (baseId: string) => {
    if (!editingBaseName || !editedBaseName.trim()) {
      handleBaseNameCancel();
      return;
    }

    updateBase.mutate({ id: baseId, name: editedBaseName });
    setEditingBaseName(null);
  };

  const handleBaseNameCancel = () => {
    setEditingBaseName(null);
    setEditedBaseName("");
  };

  const isEditingBase = editingBaseName?.baseId === baseId;

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      {/* left section */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border bg-red-600 p-2">
          <Image
            src="/airtable-mark-white.png"
            alt="airtable"
            width={21}
            height={21}
          />
        </div>

        {isEditingBase ? (
          <input
            autoFocus
            value={editedBaseName}
            onChange={(e) => setEditedBaseName(e.target.value)}
            onBlur={() => handleBaseNameSave(baseId)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleBaseNameSave(baseId);
              } else if (e.key === "Escape") {
                handleBaseNameCancel();
              }
            }}
            className="-mx-1 w-32 border-none bg-transparent px-1 font-semibold outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <button
            onDoubleClick={() => handleBaseNameClick(baseId, baseName)}
            className="-mx-2 flex items-center gap-1 rounded px-2 hover:bg-gray-100"
          >
            <span className="font-semibold">{baseName}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
        )}
      </div>
      {/* center section */}
      <nav className="flex items-center gap-6">
        <button className="hover:cursor-pointe text-sm font-medium text-gray-800">
          Data
        </button>
      </nav>
      {/* right section */}
      <div className="flex items-center gap-2">
        <button className="rounded p-1.5 hover:cursor-pointer hover:bg-gray-100">
          <RotateCcw size={18} className="text-gray-600" />
        </button>
        <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:cursor-pointer hover:bg-gray-50">
          Launch
        </button>
        <button className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:cursor-pointer hover:bg-red-700">
          Share
        </button>
      </div>
    </header>
  );
}
