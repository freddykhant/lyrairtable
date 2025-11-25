import { auth, signOut } from "~/server/auth";
import Hero from "./_components/hero";
import DashboardClient from "./dashboard-client";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return <Hero />;
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return <DashboardClient user={session.user} onSignOut={handleSignOut} />;
}
