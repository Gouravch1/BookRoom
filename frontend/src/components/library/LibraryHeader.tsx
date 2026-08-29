"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Upload, LogOut, User, ChevronDown } from "lucide-react";

export function LibraryHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/library" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-stone-900 rounded-md flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-semibold text-stone-900 tracking-tight">
            BookRoom
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link href="/books/upload">
            <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors px-2 py-1"
                id="user-menu-trigger"
              >
                <div className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {initials}
                </div>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <div className="px-2 py-1 mb-1">
                <div className="text-sm font-medium text-stone-900 truncate">{user?.name}</div>
                <div className="text-xs text-stone-500 truncate">{user?.email}</div>
              </div>
              <DropdownMenuSeparator />
              <Link href="/books/upload">
                <DropdownMenuItem className="sm:hidden">
                  <Upload className="w-4 h-4" />
                  Upload Book
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:bg-red-50 focus:text-red-700"
                id="logout-button"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
