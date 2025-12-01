"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { api } from "~/trpc/react";

interface BaseCardProps {
  id: string;
  name: string;
}

export default function BaseCard({ id, name }: BaseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();

  const initials = name.substring(0, 2).toUpperCase();

  const updateBase = api.base.update.useMutation({
    onSuccess: () => {
      utils.base.getAll.invalidate();
      setIsEditing(false);
    },
  });

  const deleteBase = api.base.delete.useMutation({
    onSuccess: () => {
      utils.base.getAll.invalidate();
      setIsDeleteModalOpen(false);
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const handleRenameStart = () => {
    setIsEditing(true);
    setEditedName(name);
    setIsDropdownOpen(false);
  };

  const handleRenameSave = () => {
    if (editedName.trim() && editedName !== name) {
      updateBase.mutate({ id, name: editedName.trim() });
    } else {
      setIsEditing(false);
    }
  };

  const handleRenameCancel = () => {
    setIsEditing(false);
    setEditedName(name);
  };

  const handleDelete = () => {
    deleteBase.mutate({ id });
  };

  return (
    <div
      className="relative rounded-lg bg-white p-8 shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Three-dot menu button - positioned at top right */}
      {!isEditing && (
        <div className="absolute top-2 right-2" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className={`rounded-md p-1 transition-opacity hover:bg-gray-100 ${
              isHovered || isDropdownOpen || isDeleteModalOpen
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && !isDeleteModalOpen && (
            <div className="absolute top-8 right-0 z-10 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameStart();
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                <Pencil className="h-4 w-4" />
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteModalOpen(true);
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}

          {/* Delete Confirmation Dropdown */}
          {isDeleteModalOpen && (
            <div className="absolute top-8 right-0 z-10 w-64 rounded-md border border-gray-200 bg-white p-4 shadow-lg">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Delete base
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Are you sure you want to delete {name}?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteModalOpen(false);
                  }}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                  disabled={deleteBase.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  disabled={deleteBase.isPending}
                >
                  {deleteBase.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Base content */}
      <div className="flex items-center gap-3">
        {isEditing ? (
          <div className="flex flex-1 items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {initials}
            </div>
            <input
              autoFocus
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleRenameSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameSave();
                } else if (e.key === "Escape") {
                  handleRenameCancel();
                }
              }}
              className="mt-2 flex-1 rounded-md border border-gray-300 bg-transparent px-2 py-1 text-lg font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <Link
            href={`/base/${id}`}
            className="flex flex-1 items-center gap-4 hover:text-blue-600"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {initials}
            </div>
            <h2 className="mt-2 text-lg font-semibold text-gray-900">{name}</h2>
          </Link>
        )}
      </div>
    </div>
  );
}
