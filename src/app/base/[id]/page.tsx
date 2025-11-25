import { auth, signOut } from "~/server/auth";
import { CollapsedSidebar } from "~/app/_components/collapsed-sidebar";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";
import BaseHeader from "~/app/_components/base-header";
import TableNav from "~/app/_components/table-nav";
import TableSidebar from "~/app/_components/table-sidebar";

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
          <BaseHeader baseName={base.name} />
          <TableNav
            tables={base.tables}
            activeTableId={base?.tables[0]?.id ?? ""}
            baseId={id}
          />
          <div className="flex flex-1">
            <TableSidebar />
            <main>
              <div>table content here</div>
            </main>
          </div>
        </main>
      </div>
    </div>
  );
}
