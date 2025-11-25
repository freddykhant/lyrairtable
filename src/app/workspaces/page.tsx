"use client";

import { useState } from "react";
import { Header } from "../_components/header";
import { Sidebar } from "../_components/sidebar";

interface WorkspacesProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut: () => void;
}

export default function Workspaces({ user, onSignOut }: WorkspacesProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onSignOut={onSignOut}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 overflow-auto bg-gray-50 p-8">
          <h1 className="mb-6 text-2xl font-semibold text-gray-900">
            All Workspaces
          </h1>
        </main>
      </div>
    </div>
  );
}
