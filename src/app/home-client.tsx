"use client";

import { useState } from "react";
import { Header } from "./_components/header";
import { Sidebar } from "./_components/sidebar";
import { api } from "~/trpc/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import BaseCard from "./_components/base-card";

interface HomeClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut: () => void;
}

export default function HomeClient({ user, onSignOut }: HomeClientProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: bases, isLoading } = api.base.getAll.useQuery();

  const createBase = api.base.create.useMutation({
    onSuccess: (newBase) => {
      if (newBase) {
        router.push(`/base/${newBase.id}`);
      }
    },
  });

  function handleCreateBase() {
    createBase.mutate({ name: "Untitled Base" });
  }

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
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Home</h1>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-blue-700"
              onClick={() => handleCreateBase()}
            >
              Create a new base
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          ) : !bases || bases.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <p className="text-xl text-gray-600">
                  You don't have any bases
                </p>
                <button
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-blue-700"
                  onClick={() => handleCreateBase()}
                >
                  Create a new base
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {bases.map((base) => (
                <BaseCard key={base.id} {...base} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
