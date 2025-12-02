"use client";

import { Search, Bell, HelpCircle, Menu } from "lucide-react";
import Image from "next/image";
import { UserButton } from "./user-button";

interface HeaderProps {
  onMenuClick?: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  onSignOut?: () => void;
}

export function Header({ onMenuClick, user, onSignOut }: HeaderProps) {
  return (
    <header className="g-background flex h-14 items-center justify-between border-b border-gray-300 px-4">
      {/* left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="opacity-50 transition duration-200 hover:cursor-pointer hover:opacity-100"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image src="/airtable.svg" alt="airtable" width={24} height={24} />
          <span className="text-lg font-bold text-gray-800">airtablesque</span>
        </div>
      </div>

      {/* center - search */}
      <div className="mx-auto max-w-md flex-1">
        <div className="relative">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search..."
            className="bg-secondary border-border placeholder-muted-foreground focus:ring-primary w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm transition-shadow duration-300 hover:shadow-md focus:ring-gray-600 focus:outline-none"
          />
          <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 transform text-xs text-gray-400">
            ⌘ K
          </span>
        </div>
      </div>

      {/* right section */}
      <div className="flex items-center gap-4">
        <button className="hover:bg-secondary text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors hover:cursor-pointer hover:bg-gray-200">
          <HelpCircle size={20} />
        </button>
        <button className="hover:bg-secondary text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors hover:cursor-pointer hover:bg-gray-200">
          <Bell size={20} />
        </button>
        {user && onSignOut ? (
          <UserButton user={user} onSignOut={onSignOut} />
        ) : (
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-white">
            ?
          </button>
        )}
      </div>
    </header>
  );
}
