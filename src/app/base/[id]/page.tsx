import { auth, signOut } from "~/server/auth";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";
import BaseClient from "../base-client";

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
    <BaseClient user={session.user} base={base} onSignOut={handleSignOut} />
  );
}
