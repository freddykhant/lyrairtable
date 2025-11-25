import { ChevronDown, RotateCcw } from "lucide-react";
import Image from "next/image";

interface BaseHeaderProps {
  baseName: string;
}

export default function BaseHeader({ baseName }: BaseHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      {/* left section */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border bg-red-600 p-2">
          <Image
            src="/airtable-mark-white.png"
            alt="airtable"
            width={21}
            height={21}
          />
        </div>
        <button className="flex items-center gap-1">
          <span className="font-semibold">{baseName}</span>
        </button>
      </div>
      {/* center section */}
      <nav className="flex items-center gap-6">
        <button className="hover:cursor-pointe text-sm font-medium text-gray-800">
          Data
        </button>
      </nav>
      {/* right section */}
      <div className="flex items-center gap-2">
        <button className="rounded p-1.5 hover:cursor-pointer hover:bg-gray-100">
          <RotateCcw size={18} className="text-gray-600" />
        </button>
        <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:cursor-pointer hover:bg-gray-50">
          Launch
        </button>
        <button className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:cursor-pointer hover:bg-red-700">
          Share
        </button>
      </div>
    </header>
  );
}
