"use client";

import BaseHeader from "../_components/base-header";
import TableHeader from "../_components/table-header";
import TableSidebar from "../_components/table-sidebar";
import TableNav from "../_components/table-nav";
import { CollapsedSidebar } from "../_components/collapsed-sidebar";
import type { columns, rows, tables } from "~/server/db/schema";
import { useState, useEffect } from "react";
import Table from "../_components/table";
import { api } from "~/trpc/react";

type ViewConfig = {
  filters?: Array<{
    columnId: string;
    operator:
      | "contains"
      | "notContains"
      | "equals"
      | "isEmpty"
      | "isNotEmpty"
      | "greaterThan"
      | "lessThan";
    value?: string;
  }>;
  sorts?: Array<{
    columnId: string;
    direction: "asc" | "desc";
  }>;
  hiddenColumns?: string[];
};

const EMPTY_COLUMNS: (typeof columns.$inferSelect)[] = [];

interface BaseClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  base: {
    id: string;
    name: string;
    tables: (typeof tables.$inferSelect)[];
  };
  onSignOut: () => void;
}

export default function BaseClient({ user, base, onSignOut }: BaseClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTableId, setActiveTableId] = useState(base.tables[0]?.id ?? "");
  const [allRows, setAllRows] = useState<(typeof rows.$inferSelect)[]>([]); // rows accumulator array
  const [totalRows, setTotalRows] = useState(0); // total rows count
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [hideColumnsOpen, setHideColumnsOpen] = useState(false);

  const utils = api.useUtils();

  // bulk seed rows
  const bulkSeedMutation = api.bulk.seedRows.useMutation({
    onSuccess: () => {
      utils.row.getByTableId.invalidate({
        tableId: activeTableId,
      });
    },
  });

  // get views for this table
  const { data: viewsData, isLoading: viewsLoading } =
    api.view.getByTableId.useQuery(
      { tableId: activeTableId },
      { enabled: !!activeTableId },
    );

  // update view
  const updateView = api.view.update.useMutation({
    onSuccess: () => {
      utils.view.getByTableId.invalidate({ tableId: activeTableId });
    },
  });

  // get active view config
  const activeView = viewsData?.find((view) => view.id === activeViewId);
  const viewConfig = activeView?.config as ViewConfig | undefined;
  const viewFilters = viewConfig?.filters ?? [];
  const viewSorts = viewConfig?.sorts ?? [];

  // get table data
  const { data: tableData, isLoading: tableLoading } =
    api.table.getById.useQuery(
      { id: activeTableId, baseId: base.id },
      { enabled: !!activeTableId && !!base.id },
    );

  // hidden columns
  const viewHiddenColumns = viewConfig?.hiddenColumns ?? [];
  const visibleColumns = (tableData?.columns ?? EMPTY_COLUMNS).filter(
    (col) => !viewHiddenColumns.includes(col.id),
  );

  // intitial fetch (smaller batches now)
  const { data: rowsData, isLoading: rowsLoading } =
    api.row.getByTableId.useQuery(
      {
        tableId: activeTableId,
        limit: 100,
        offset: 0,
        searchTerm: searchTerm,
        filters: viewFilters,
        sorts: viewSorts,
      },
      { enabled: !!activeTableId },
    );

  // add rows
  const handleAddRows = () => {
    bulkSeedMutation.mutate({ tableId: activeTableId, count: 100000 });
  };

  // intialise allRows when data loads
  useEffect(() => {
    if (rowsData && activeTableId) {
      setAllRows(rowsData.rows);
      setTotalRows(rowsData.total);
    }
  }, [rowsData, activeTableId]);

  // fetch more rows for infinite scroll
  const fetchMoreRows = async () => {
    if (allRows.length >= totalRows) return; // already have all rows

    try {
      const result = await utils.row.getByTableId.fetch({
        tableId: activeTableId,
        limit: 100,
        offset: allRows.length, // start where we left off
        searchTerm: searchTerm,
        filters: viewFilters,
        sorts: viewSorts,
      });

      setAllRows((prev) => [...prev, ...result.rows]); // append new rows
    } catch (error) {
      console.error("Failed to fetch more rows:", error);
    }
  };

  // update a row in local state (optimistic update)
  const handleRowUpdate = (
    rowId: string,
    updatedData: Record<string, string>,
  ) => {
    setAllRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, data: updatedData } : row,
      ),
    );
  };

  // search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDebouncedSearchTerm(e.target.value);
  };

  // toggle column visibility
  const handleToggleColumn = (columnId: string) => {
    if (!activeViewId) return;

    const newHiddenColumns = viewHiddenColumns.includes(columnId)
      ? viewHiddenColumns.filter((id) => id !== columnId) // show
      : [...viewHiddenColumns, columnId]; // hide

    updateView.mutate({
      id: activeViewId,
      config: {
        filters: viewFilters,
        sorts: viewSorts,
        hiddenColumns: newHiddenColumns,
      },
    });
  };

  // hide all columns
  const handleHideAll = () => {
    if (!activeViewId) return;

    const allColumnIds = (tableData?.columns ?? []).map((col) => col.id);

    updateView.mutate({
      id: activeViewId,
      config: {
        filters: viewFilters,
        sorts: viewSorts,
        hiddenColumns: allColumnIds,
      },
    });
  };

  // show all columns
  const handleShowAll = () => {
    if (!activeViewId) return;

    updateView.mutate({
      id: activeViewId,
      config: {
        filters: viewFilters,
        sorts: viewSorts,
        hiddenColumns: [],
      },
    });
  };

  // debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(debouncedSearchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedSearchTerm]);

  // auto-select first view when table changes
  useEffect(() => {
    if (viewsData && viewsData.length > 0) {
      // if current activeViewId doesn't belong to this table's views, reset it
      const viewExists = viewsData.some((v) => v.id === activeViewId);
      if (!viewExists) {
        setActiveViewId(viewsData[0]?.id ?? null);
      }
    }
  }, [viewsData, activeViewId]);

  // update sort
  const handleUpdateSort = (columnId: string, direction: "asc" | "desc") => {
    if (!activeViewId) return;

    // replace or add sort for this column
    const newSorts = [{ columnId, direction }];

    updateView.mutate({
      id: activeViewId,
      config: {
        filters: viewFilters,
        sorts: newSorts,
        hiddenColumns: viewHiddenColumns,
      },
    });
  };

  return (
    <div className="flex h-screen">
      <CollapsedSidebar user={user} onSignOut={onSignOut} />

      <div className="flex flex-1 flex-col bg-gray-50">
        <BaseHeader baseId={base.id} baseName={base.name} />
        <TableNav
          tables={base.tables}
          activeTableId={activeTableId}
          baseId={base.id}
          onTableChange={setActiveTableId}
        />

        <div className="flex flex-1 flex-col">
          <TableHeader
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onAddRows={handleAddRows}
            isLoading={bulkSeedMutation.isPending}
            onSearch={handleSearch}
            searchTerm={debouncedSearchTerm}
            columns={tableData?.columns ?? EMPTY_COLUMNS}
            hiddenColumns={viewHiddenColumns}
            onToggleHideColumns={() => setHideColumnsOpen(!hideColumnsOpen)}
            hideColumnsOpen={hideColumnsOpen}
            onToggleColumn={handleToggleColumn}
            onHideAll={handleHideAll}
            onShowAll={handleShowAll}
          />

          <div className="flex flex-1 overflow-hidden">
            <TableSidebar
              isOpen={sidebarOpen}
              views={viewsData ?? []}
              viewsLoading={viewsLoading}
              activeViewId={activeViewId}
              onViewChange={setActiveViewId}
              tableId={activeTableId}
            />
            <div className="flex-1 overflow-auto bg-white text-sm">
              <Table
                tableId={activeTableId}
                columns={visibleColumns}
                rows={allRows}
                totalRows={totalRows}
                isLoading={tableLoading || rowsLoading}
                onFetchMore={fetchMoreRows}
                onRowUpdate={handleRowUpdate}
                activeViewId={activeViewId ?? ""}
                currentSorts={viewSorts}
                onUpdateSort={handleUpdateSort}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
