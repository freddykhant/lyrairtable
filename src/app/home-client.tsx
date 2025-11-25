"use client";

import { useState } from "react";
import { Header } from "./_components/header";
import { Sidebar } from "./_components/sidebar";
import { api } from "~/trpc/react";
import { Link, Loader2 } from "lucide-react";

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
          <div>
            <h1 className="mb-6 text-2xl font-semibold text-gray-900">Home</h1>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          ) : !bases?.length || bases.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <p className="text-xl text-gray-600">
                  You don't have any bases
                </p>
                <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-blue-700">
                  Create a new base
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bases.map((base) => (
                  <div
                    key={base.id}
                    className="rounded-lg bg-white p-4 shadow-sm"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">
                      {base.name}
                    </h2>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
