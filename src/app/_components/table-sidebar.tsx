import { Plus, LayoutGrid, Loader2 } from "lucide-react";
import { views } from "~/server/db/schema";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TableSidebarProps {
  isOpen: boolean;
  views: (typeof views.$inferSelect)[];
  viewsLoading: boolean;
  activeViewId: string | null;
  onViewChange: (viewId: string) => void;
  tableId: string;
}

export default function TableSidebar({
  isOpen,
  views,
  viewsLoading,
  activeViewId,
  onViewChange,
  tableId,
}: TableSidebarProps) {
  const [editingViewName, setEditingViewName] = useState<{
    viewId: string;
  } | null>(null);
  const [editedViewName, setEditedViewName] = useState<string>("");

  const router = useRouter();
  const utils = api.useUtils();

  const createView = api.view.create.useMutation({
    onSuccess: () => {
      utils.view.getByTableId.invalidate({ tableId: tableId });
      router.refresh();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const updateView = api.view.update.useMutation({
    onSuccess: () => {
      utils.view.getByTableId.invalidate({ tableId: tableId });
      router.refresh();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleAddView = async () => {
    createView.mutate({
      name: "New View",
      tableId,
      config: {
        filters: [],
        sorts: [],
      },
    });
  };

  const handleViewClick = (viewId: string, currentName: string) => {
    setEditingViewName({ viewId });
    setEditedViewName(currentName);
  };

  const handleViewSave = (viewId: string) => {
    if (!editingViewName || !editedViewName.trim()) {
      handleViewCancel();
      return;
    }

    updateView.mutate({
      id: viewId,
      name: editedViewName,
      config: {
        filters: [],
        sorts: [],
        hiddenColumns: [],
      },
    });
    setEditingViewName(null);
  };

  const handleViewCancel = () => {
    setEditingViewName(null);
    setEditedViewName("");
  };

  return (
    <aside
      className={`border-r border-gray-200 bg-white text-sm transition-all ${
        isOpen ? "w-64" : "w-0"
      }`}
    >
      {isOpen && (
        <div className="flex flex-col space-y-1 p-3">
          <button
            onClick={handleAddView}
            disabled={createView.isPending}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
          >
            <Plus size={16} />
            <span>
              {createView.isPending ? "Creating..." : "Create new..."}
            </span>
          </button>

          <div className="my-2 border-t border-gray-200" />

          {/* render views list */}
          {viewsLoading ? (
            <div className="flex items-center justify-center p-3">
              <Loader2 size={16} className="animate-spin text-gray-600" />
              <span className="text-sm text-gray-600">Loading views...</span>
            </div>
          ) : (
            views.map((view) => {
              const isEditingView = editingViewName?.viewId === view.id;
              const isActive = activeViewId === view.id;

              return (
                <div
                  key={view.id}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-gray-100 font-medium text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <LayoutGrid
                    size={16}
                    className={isActive ? "text-blue-600" : "text-gray-400"}
                  />

                  {isEditingView ? (
                    <input
                      autoFocus
                      value={editedViewName}
                      onChange={(e) => setEditedViewName(e.target.value)}
                      onBlur={() => handleViewSave(view.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleViewSave(view.id);
                        else if (e.key === "Escape") handleViewCancel();
                      }}
                      className="flex-1 border-none bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <button
                      onClick={() => onViewChange(view.id)}
                      onDoubleClick={() => handleViewClick(view.id, view.name)}
                      className="flex-1 text-left"
                    >
                      {view.name}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </aside>
  );
}
