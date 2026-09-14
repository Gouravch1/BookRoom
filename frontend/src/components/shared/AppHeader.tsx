"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  BookMarked,
  Lock,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Upload,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Free Books", href: "/free-books", icon: BookOpen },
  { label: "My Library", href: "/library", icon: BookMarked },
  { label: "Private", href: "/private", icon: Lock },
  { label: "Admin", href: "/admin", icon: ShieldCheck, adminOnly: true },
];

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const visibleNav = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <header
        className="sticky top-0 z-40 glass"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link
            href="/free-books"
            className="flex items-center gap-2.5 shrink-0"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "var(--accent)",
                boxShadow: "0 3px 10px var(--accent-glow)",
              }}
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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background: active ? "var(--accent-dim)" : "transparent",
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    border: active
                      ? "1px solid rgba(232,160,69,0.18)"
                      : "1px solid transparent",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Upload shortcut (desktop only) */}
            <Link href="/books/upload" className="hidden sm:block">
              <button
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
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

            {/* User menu — desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="hidden md:flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition-all duration-200"
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
                  <ChevronDown
                    className="w-3 h-3"
                    style={{ color: "var(--text-muted)" }}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2.5">
                  <div
                    className="text-sm font-semibold truncate flex items-center gap-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user?.name}
                    {isAdmin && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "var(--accent-dim)",
                          color: "var(--accent)",
                          border: "1px solid rgba(232,160,69,0.3)",
                        }}
                      >
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div
                    className="text-xs truncate mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {user?.email}
                  </div>
                </div>
                <DropdownMenuSeparator />
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

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-default)",
              }}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
              ) : (
                <Menu
                  className="w-4 h-4"
                  style={{ color: "var(--text-secondary)" }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div
            className="md:hidden border-t animate-fade-up"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--bg-surface)",
            }}
          >
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {visibleNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: active ? "var(--accent-dim)" : "transparent",
                      color: active ? "var(--accent)" : "var(--text-secondary)",
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <div
                className="my-1"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              />
              <Link
                href="/books/upload"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ color: "var(--text-secondary)" }}
              >
                <Upload className="w-4 h-4" />
                Upload Book
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 text-red-400"
                id="mobile-logout-button"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
              <div className="px-3 py-2">
                <div
                  className="text-xs flex items-center gap-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Signed in as{" "}
                  <span style={{ color: "var(--text-secondary)" }}>
                    {user?.name}
                  </span>
                  {isAdmin && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "var(--accent-dim)",
                        color: "var(--accent)",
                        border: "1px solid rgba(232,160,69,0.3)",
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
