"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Upload, LogOut, ChevronDown } from "lucide-react";

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
    <header
      className="sticky top-0 z-40 glass"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        {/* Logo */}
        <Link href="/library" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent)", boxShadow: "0 3px 10px var(--accent-glow)" }}
          >
            <BookOpen className="w-4 h-4" style={{ color: "#0e0e0f" }} />
          </div>
          <span
            className="font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            BookRoom
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Upload button (desktop) */}
          <Link href="/books/upload">
            <button
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </button>
          </Link>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition-all duration-200"
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border-default)",
                }}
                id="user-menu-trigger"
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "var(--accent)", color: "#0e0e0f" }}
                >
                  {initials}
                </div>
                <ChevronDown className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2.5">
                <div
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {user?.name}
                </div>
                <div className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {user?.email}
                </div>
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
                className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
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
