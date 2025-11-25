import { auth, signOut } from "~/server/auth";
import Hero from "./_components/hero";
import HomeClient from "./home-client";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return <Hero />;
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return <HomeClient user={session.user} onSignOut={handleSignOut} />;
}
