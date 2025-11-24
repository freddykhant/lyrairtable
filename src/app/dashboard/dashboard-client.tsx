"use client";

import { useState } from "react";
import { Header } from "../_components/header";
import { Sidebar } from "../_components/sidebar";
import { api } from "~/trpc/react";

interface DashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut: () => void;
}

export default function DashboardClient({
  user,
  onSignOut,
}: DashboardClientProps) {
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
          <div className="mx-auto max-w-7xl">
            <h1 className="mb-6 text-2xl font-semibold text-gray-900">
              My Bases
            </h1>

            {isLoading ? (
              <div className="text-gray-500">Loading...</div>
            ) : bases && bases.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {bases.map((base) => (
                  <div
                    key={base.id}
                    className="cursor-pointer rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    style={{ borderColor: "rgba(0, 0, 0, 0.1)" }}
                  >
                    <h3 className="text-lg font-medium text-gray-900">
                      {base.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Created {new Date(base.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  No bases yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create your first base to get started
                </p>
                <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                  Create Base
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
