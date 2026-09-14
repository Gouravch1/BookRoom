"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { bookService } from "@/services/book.service";
import { libraryService } from "@/services/library.service";
import { getApiErrorMessage } from "@/lib/api-client";
import type { BookResponse } from "@/types/book";
import { AppHeader } from "@/components/shared/AppHeader";
import { FreeBookCard } from "@/components/free-books/FreeBookCard";
import { FreeBookSkeleton } from "@/components/free-books/FreeBookSkeleton";
import { AlertCircle, RefreshCw, Search, BookOpen } from "lucide-react";
import { Metadata } from "next";

export default function FreeBooksPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [books, setBooks] = useState<BookResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [libraryIds, setLibraryIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      const [freeBooks, library] = await Promise.all([
        bookService.getFreeBooks(),
        libraryService.getMyLibrary().catch(() => []),
      ]);
      setBooks(freeBooks);
      setLibraryIds(new Set(library.map((item) => item.bookId)));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q))
    );
  }, [books, query]);

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <div
          className="w-7 h-7 border-2 rounded-full animate-spin"
          style={{
            borderColor: "var(--border-strong)",
            borderTopColor: "var(--accent)",
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-base)" }}
    >
      <AppHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="mb-8 animate-fade-up">
          <h1
            className="font-serif text-3xl sm:text-4xl mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Free Books
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Read something new, completely free.
          </p>
        </div>

        {/* Search bar */}
        {!isLoading && !error && books.length > 0 && (
          <div
            className="relative mb-8 max-w-sm animate-fade-up"
            style={{ animationDelay: "60ms" }}
          >
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="search"
              placeholder="Search by title or author…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-sm rounded-xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
              id="free-books-search"
            />
          </div>
        )}

        {/* States */}
        {isLoading ? (
          <FreeBookSkeleton count={10} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center animate-fade-up">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "var(--red-dim)",
                border: "1px solid rgba(248,113,113,0.2)",
              }}
            >
              <AlertCircle
                className="w-7 h-7"
                style={{ color: "var(--red)" }}
              />
            </div>
            <div>
              <p
                className="font-semibold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Failed to load books
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {error}
              </p>
            </div>
            <button
              onClick={fetchData}
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
        ) : books.length === 0 ? (
          /* Empty state — no books at all */
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-fade-up">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-7"
              style={{
                background: "var(--accent-dim)",
                border: "1px solid rgba(232,160,69,0.2)",
                boxShadow: "0 0 40px var(--accent-glow)",
              }}
            >
              <BookOpen
                className="w-9 h-9"
                style={{ color: "var(--accent)" }}
              />
            </div>
            <h2
              className="font-serif text-2xl sm:text-3xl mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              No free books yet
            </h2>
            <p
              className="text-sm sm:text-base max-w-xs leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Check back soon — free books will appear here when published.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty filtered state */
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center animate-fade-up">
            <Search className="w-8 h-8" style={{ color: "var(--text-muted)" }} />
            <p
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              No results for &quot;{query}&quot;
            </p>
            <button
              onClick={() => setQuery("")}
              className="text-sm"
              style={{ color: "var(--accent)" }}
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger-children">
            {filtered.map((book) => (
              <FreeBookCard
                key={book.id}
                book={book}
                inLibrary={libraryIds.has(book.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
