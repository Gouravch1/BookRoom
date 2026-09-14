"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { bookService } from "@/services/book.service";
import { getApiErrorMessage } from "@/lib/api-client";
import type { BookResponse } from "@/types/book";
import { AppHeader } from "@/components/shared/AppHeader";
import { PrivateBookCard } from "@/components/private/PrivateBookCard";
import { FreeBookSkeleton } from "@/components/free-books/FreeBookSkeleton";
import { Lock, Search, AlertCircle, RefreshCw, Upload } from "lucide-react";

export default function PrivateBooksPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [books, setBooks] = useState<BookResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  async function fetchPrivateBooks() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookService.getMyBooks();
      setBooks(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchPrivateBooks();
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

  function handleBookDeleted(deletedId: number) {
    setBooks((prev) => prev.filter((b) => b.id !== deletedId));
  }

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
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap animate-fade-up">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1
                className="font-serif text-3xl sm:text-4xl"
                style={{ color: "var(--text-primary)" }}
              >
                Private Books
              </h1>
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                style={{
                  background: "rgba(232,160,69,0.14)",
                  color: "var(--accent)",
                  border: "1px solid rgba(232,160,69,0.25)",
                }}
              >
                <Lock className="w-3 h-3" />
                Only You
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {!isLoading && books.length > 0
                ? `${books.length} personal book${books.length !== 1 ? "s" : ""} uploaded by you`
                : "Your private uploads — accessible only to your account"}
            </p>
          </div>

          <Link href="/books/upload">
            <button
              id="upload-private-book-btn"
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
              placeholder="Search your private books…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-sm rounded-xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
              id="private-books-search"
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
                Failed to load your private books
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {error}
              </p>
            </div>
            <button
              onClick={fetchPrivateBooks}
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
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-fade-up">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: "rgba(232,160,69,0.12)",
                border: "1px solid rgba(232,160,69,0.25)",
                boxShadow: "0 0 40px var(--accent-glow)",
              }}
            >
              <Lock
                className="w-9 h-9"
                style={{ color: "var(--accent)" }}
              />
            </div>
            <h2
              className="font-serif text-2xl sm:text-3xl mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No private books yet
            </h2>
            <p
              className="text-sm sm:text-base max-w-sm mb-7 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Upload PDF documents to read them privately in BookRoom. Only you have access to these files.
            </p>
            <Link href="/books/upload">
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: "var(--accent)",
                  color: "#0e0e0f",
                  boxShadow: "0 4px 16px var(--accent-glow)",
                }}
              >
                <Upload className="w-4 h-4" />
                Upload Your First Book
              </button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          /* Search yielded no results */
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center animate-fade-up">
            <Search className="w-8 h-8" style={{ color: "var(--text-muted)" }} />
            <p
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              No private books matching &quot;{query}&quot;
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
              <PrivateBookCard
                key={book.id}
                book={book}
                onDeleted={handleBookDeleted}
                onUpdated={fetchPrivateBooks}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
