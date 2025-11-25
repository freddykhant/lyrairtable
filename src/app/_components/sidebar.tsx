"use client";

import {
  Home,
  Star,
  Share2,
  Users,
  Plus,
  BookOpen,
  ShoppingBag,
  Globe,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const navItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Star, label: "Starred" },
    { icon: Share2, label: "Shared" },
    { icon: Users, label: "Bases" },
  ];

  const bottomItems = [
    { icon: BookOpen, label: "Templates and apps" },
    { icon: ShoppingBag, label: "Marketplace" },
    { icon: Globe, label: "Import" },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-300 bg-white">
      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item, idx) => (
          <button
            key={idx}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              item.active
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon size={20} className="flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}

        {/* Bases Section */}
        <div
          className="mt-4 border-t pt-4"
          style={{ borderColor: "rgba(0, 0, 0, 0.06)" }}
        >
          <button className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
            <div className="flex items-center gap-3">
              <Users size={20} className="flex-shrink-0" />
              <span>Bases</span>
            </div>
            <Plus size={16} className="text-gray-400" />
          </button>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <nav
        className="space-y-1 border-t p-3"
        style={{ borderColor: "rgba(0, 0, 0, 0.06)" }}
      >
        {bottomItems.map((item, idx) => (
          <button
            key={idx}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <item.icon size={18} className="flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}

        {/* Create Button */}
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition-opacity hover:bg-blue-700">
          <Plus size={18} />
          <span>Create</span>
        </button>
      </nav>
    </aside>
  );
}
