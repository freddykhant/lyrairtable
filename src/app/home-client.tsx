"use client";

import { useState } from "react";
import { Header } from "./_components/header";
import { Sidebar } from "./_components/sidebar";
import { api } from "~/trpc/react";

interface HomeClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut: () => void;
}

export default function HomeClient({ user, onSignOut }: HomeClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: bases, isLoading } = api.base.getAll.useQuery();

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
            All Bases
          </h1>
        </main>
      </div>
    </div>
  );
}
