"use client";

import BaseHeader from "../_components/base-header";
import TableHeader from "../_components/table-header";
import TableSidebar from "../_components/table-sidebar";
import TableNav from "../_components/table-nav";
import { CollapsedSidebar } from "../_components/collapsed-sidebar";
import type { tables, users } from "~/server/db/schema";
import { useState } from "react";
import Table from "../_components/table";

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

  return (
    <div className="flex h-screen">
      <CollapsedSidebar user={user} onSignOut={onSignOut} />

      <div className="flex flex-1 flex-col bg-gray-50">
        <BaseHeader baseName={base.name} />
        <TableNav
          tables={base.tables}
          activeTableId={base.tables[0]?.id ?? ""}
          baseId={base.id}
        />

        <div className="flex flex-1 flex-col">
          <TableHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <div className="flex flex-1 overflow-hidden">
            <TableSidebar isOpen={sidebarOpen} />
            <div className="flex-1 overflow-auto bg-white p-4 text-sm">
              <Table />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
