"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { LogOut, ChevronDown, ChevronUp } from "lucide-react";

export default function LoggedInNavbar({
  user,
}: {
  user: {
    avatar_url: string | null;
    full_name: string | null;
    email: string | null;
  };
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between py-6 px-4 sm:px-6 lg:px-8 border-b border-white/10">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image
          src="/icon.png"
          alt="Desygn icon"
          width={40}
          height={40}
          className="w-10 h-10"
        />
        <span className="text-2xl font-bold text-white">Desygn</span>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link
          href="/dashboard"
          className="text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md"
        >
          Dashboard
        </Link>
        <Link
          href="/problems"
          className="text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md"
        >
          Problems
        </Link>
        <Link
          href="/submissions"
          className="text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md"
        >
          Submissions
        </Link>
      </div>

      {/* User Profile */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 focus:outline-none bg-white/5 hover:bg-white/10 transition-colors rounded-full pl-2 pr-3 py-1"
        >
          <Image
            src={user.avatar_url || "/default-avatar.png"}
            alt="User Profile"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full border border-white/20"
          />
          {dropdownOpen ? (
            <ChevronUp className="w-4 h-4 text-white/70" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/70" />
          )}
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-[#252830] rounded-lg shadow-lg z-10 border border-white/10 backdrop-blur-sm overflow-hidden">
            <div className="py-2 px-4 border-b border-white/10">
              <p className="text-sm font-medium text-white">{user.full_name}</p>
              <p className="text-xs text-white/60 truncate">{user.email}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => router.push("/settings")}
                className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
