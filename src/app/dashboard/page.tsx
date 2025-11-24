import { auth, signOut } from "~/server/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return <DashboardClient user={session.user} onSignOut={handleSignOut} />;
}
