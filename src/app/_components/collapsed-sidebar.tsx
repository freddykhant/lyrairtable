import { HelpCircle, Bell } from "lucide-react";
import { UserButton } from "./user-button";
import Image from "next/image";
import Link from "next/link";

interface CollapsedSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  onSignOut?: () => void;
}

export function CollapsedSidebar({ user, onSignOut }: CollapsedSidebarProps) {
  return (
    <div className="flex h-full w-16 flex-col items-center border-r border-gray-300 bg-white p-3">
      {/* Top: Logo */}
      <Link href="/">
        <div className="mb-4 hover:cursor-pointer">
          <Image src="/airtable.svg" alt="airtable" width={24} height={24} />
        </div>
      </Link>

      {/* Middle: Flexible spacer */}
      <div className="flex-1" />

      {/* Bottom: Icons */}
      <div className="flex flex-col items-center gap-4">
        <button className="flex h-8 w-8 items-center justify-center rounded-full hover:cursor-pointer hover:bg-gray-200">
          <HelpCircle size={16} />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full hover:cursor-pointer hover:bg-gray-200">
          <Bell size={16} />
        </button>
        {user && onSignOut ? (
          <UserButton user={user} onSignOut={onSignOut} position="left" />
        ) : (
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-white">
            ?
          </button>
        )}
      </div>
    </div>
  );
}
