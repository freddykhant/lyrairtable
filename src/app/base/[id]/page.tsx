import { api } from "~/trpc/server";

export default async function BasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const base = await api.base.getById({ id });

  return <div>BasePage</div>;
}
