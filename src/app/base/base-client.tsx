"use client";

import BaseHeader from "../_components/base-header";
import TableHeader from "../_components/table-header";
import TableSidebar from "../_components/table-sidebar";
import TableNav from "../_components/table-nav";
import { CollapsedSidebar } from "../_components/collapsed-sidebar";
import type { columns, rows, tables, users } from "~/server/db/schema";
import { useState } from "react";
import Table from "../_components/table";
import { api } from "~/trpc/react";

const EMPTY_COLUMNS: (typeof columns.$inferSelect)[] = [];
const EMPTY_ROWS: (typeof rows.$inferSelect)[] = [];

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

  const utils = api.useUtils();

  const bulkSeedMutation = api.bulk.seedRows.useMutation({
    onSuccess: () => {
      utils.row.getByTableId.invalidate({ tableId: activeTableId });
    },
  });

  const handleAddRows = () => {
    bulkSeedMutation.mutate({ tableId: activeTableId, count: 100000 });
  };

  const { data: tableData, isLoading: tableLoading } =
    api.table.getById.useQuery(
      { id: activeTableId, baseId: base.id },
      { enabled: !!activeTableId && !!base.id },
    );

  const { data: rowsData, isLoading: rowsLoading } =
    api.row.getByTableId.useQuery(
      { tableId: activeTableId, limit: 50 },
      { enabled: !!activeTableId },
    );

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
          />

          <div className="flex flex-1 overflow-hidden">
            <TableSidebar isOpen={sidebarOpen} />
            <div className="flex-1 overflow-auto bg-white text-sm">
              <Table
                tableId={activeTableId}
                columns={tableData?.columns ?? EMPTY_COLUMNS}
                rows={rowsData ?? EMPTY_ROWS}
                isLoading={tableLoading || rowsLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
