import { auth, signOut } from "~/server/auth";
import { CollapsedSidebar } from "~/app/_components/collapsed-sidebar";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";

export default async function BasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const base = await api.base.getById({ id });

  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1">
        <CollapsedSidebar user={session.user} onSignOut={handleSignOut} />
        <main className="flex-1 bg-gray-50">
          <div className="p-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              {base.name}
            </h1>
          </div>
        </main>
      </div>
    </div>
  );
}
