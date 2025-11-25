import Link from "next/link";

interface BaseCardProps {
  id: string;
  name: string;
}

export default function BaseCard({ id, name }: BaseCardProps) {
  const initials = name.substring(0, 2).toUpperCase();

  return (
    <Link
      href={`/base/${id}`}
      className="flex items-center gap-3 rounded-lg bg-white p-8 shadow-sm hover:text-blue-600"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {initials}
        </div>
        <h2 className="mt-2 text-lg font-semibold text-gray-900">{name}</h2>
      </div>
    </Link>
  );
}
