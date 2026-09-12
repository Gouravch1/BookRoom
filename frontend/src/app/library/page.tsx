"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLibrary } from "@/hooks/useLibrary";
import { bookService } from "@/services/book.service";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { LibraryBookCard } from "@/components/library/LibraryBookCard";
import { LibraryEmpty } from "@/components/library/LibraryEmpty";
import { LibrarySkeleton } from "@/components/library/LibrarySkeleton";
import { Upload, AlertCircle, RefreshCw } from "lucide-react";

export default function LibraryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { library, isLoading, error, fetchLibrary, removeFromLibrary } =
    useLibrary();
  const [myBookIds, setMyBookIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchLibrary();
    bookService
      .getMyBooks()
      .then((books) => {
        setMyBookIds(new Set(books.map((b) => b.id)));
      })
      .catch(() => {});
  }, [isAuthenticated, fetchLibrary]);

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <div
          className="w-7 h-7 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--border-strong)", borderTopColor: "var(--accent)" }}
        />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      <LibraryHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Page title row */}
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap animate-fade-up">
          <div>
            <h1
              className="font-serif text-3xl sm:text-4xl"
              style={{ color: "var(--text-primary)" }}
            >
              My Library
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {!isLoading && library.length > 0
                ? `${library.length} book${library.length !== 1 ? "s" : ""} in your collection`
                : "Your personal reading collection"}
            </p>
          </div>
          <Link href="/books/upload">
            <button
              id="upload-book-button"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: "var(--accent)",
                color: "#0e0e0f",
                boxShadow: "0 4px 16px var(--accent-glow)",
              }}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Book
            </button>
          </Link>
        </div>

        {/* States */}
        {isLoading ? (
          <LibrarySkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center animate-fade-up">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--red-dim)", border: "1px solid rgba(248,113,113,0.2)" }}
            >
              <AlertCircle className="w-7 h-7" style={{ color: "var(--red)" }} />
            </div>
            <div>
              <p
                className="font-semibold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Failed to load your library
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {error}
              </p>
            </div>
            <button
              onClick={fetchLibrary}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        ) : library.length === 0 ? (
          <LibraryEmpty />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 stagger-children">
            {library.map((item) => (
              <LibraryBookCard
                key={item.libraryItemId}
                item={item}
                isOwned={myBookIds.has(item.bookId)}
                onRemoved={removeFromLibrary}
                onUpdated={fetchLibrary}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
