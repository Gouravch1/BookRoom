"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { bookService } from "@/services/book.service";
import { getApiErrorMessage } from "@/lib/api-client";
import { toast } from "@/components/ui/toaster";
import type { BookResponse } from "@/types/book";
import { AppHeader } from "@/components/shared/AppHeader";
import { UploadBookForm } from "@/components/books/UploadBookForm";
import { EditBookDialog } from "@/components/library/EditBookDialog";
import {
  ShieldCheck,
  BookOpen,
  Upload,
  Search,
  AlertCircle,
  RefreshCw,
  Trash2,
  Pencil,
  FileText,
  BookMarked,
  Sparkles,
} from "lucide-react";

export default function AdminPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [books, setBooks] = useState<BookResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"books" | "upload">("books");

  // Edit dialog state
  const [editingBook, setEditingBook] = useState<BookResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Role guard
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role !== "ADMIN") {
        router.replace("/free-books");
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  async function fetchBooks() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookService.getFreeBooks();
      setBooks(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      fetchBooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q))
    );
  }, [books, query]);

  const totalPages = useMemo(() => {
    return books.reduce((sum, b) => sum + (b.totalPages || 0), 0);
  }, [books]);

  async function handleDelete(book: BookResponse) {
    if (
      !confirm(
        `Are you sure you want to delete "${book.title}"? It will be removed from the public Free Books feed.`
      )
    ) {
      return;
    }
    setDeletingId(book.id);
    try {
      await bookService.deleteBook(book.id);
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
      toast({
        title: "Book removed",
        description: `"${book.title}" was removed from Free Books.`,
      });
    } catch (err) {
      toast({
        title: "Failed to delete book",
        description: getApiErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading || (isAuthenticated && user?.role !== "ADMIN")) {
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
        {/* Header Title & Role Badge */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap animate-fade-up">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1
                className="font-serif text-3xl sm:text-4xl"
                style={{ color: "var(--text-primary)" }}
              >
                Admin Dashboard
              </h1>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
                style={{
                  background: "rgba(232,160,69,0.18)",
                  color: "var(--accent)",
                  border: "1px solid rgba(232,160,69,0.35)",
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                ADMIN
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Manage community free books, publish new titles, and review platform content.
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div
            className="flex p-1 rounded-xl"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
            }}
          >
            <button
              onClick={() => setActiveTab("books")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background:
                  activeTab === "books" ? "var(--accent)" : "transparent",
                color: activeTab === "books" ? "#0e0e0f" : "var(--text-secondary)",
                fontWeight: activeTab === "books" ? 600 : 500,
              }}
            >
              <BookOpen className="w-4 h-4" />
              Manage Free Books ({books.length})
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background:
                  activeTab === "upload" ? "var(--accent)" : "transparent",
                color: activeTab === "upload" ? "#0e0e0f" : "var(--text-secondary)",
                fontWeight: activeTab === "upload" ? 600 : 500,
              }}
            >
              <Upload className="w-4 h-4" />
              Publish New Book
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-up">
          <div
            className="p-5 rounded-2xl flex items-center gap-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(52,211,153,0.15)",
                border: "1px solid rgba(52,211,153,0.25)",
              }}
            >
              <BookOpen className="w-6 h-6" style={{ color: "var(--emerald)" }} />
            </div>
            <div>
              <div
                className="text-2xl font-serif font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {isLoading ? "…" : books.length}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                Published Free Books
              </div>
            </div>
          </div>

          <div
            className="p-5 rounded-2xl flex items-center gap-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(232,160,69,0.15)",
                border: "1px solid rgba(232,160,69,0.25)",
              }}
            >
              <BookMarked className="w-6 h-6" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <div
                className="text-2xl font-serif font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {isLoading ? "…" : totalPages.toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                Total Catalog Pages
              </div>
            </div>
          </div>

          <div
            className="p-5 rounded-2xl flex items-center gap-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(96,165,250,0.15)",
                border: "1px solid rgba(96,165,250,0.25)",
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: "#60a5fa" }} />
            </div>
            <div>
              <div
                className="text-sm font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {user?.email}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                Logged in as Administrator
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: Manage Books */}
        {activeTab === "books" && (
          <div className="flex flex-col gap-6 animate-fade-up">
            {/* Search and refresh toolbar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative max-w-sm w-full">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="search"
                  placeholder="Filter published books…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 text-sm rounded-xl"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                  id="admin-search-input"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchBooks}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                  style={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* Content states */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div
                  className="w-7 h-7 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: "var(--border-strong)",
                    borderTopColor: "var(--accent)",
                  }}
                />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Loading catalog…
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: "var(--red-dim)",
                    border: "1px solid rgba(248,113,113,0.2)",
                  }}
                >
                  <AlertCircle
                    className="w-6 h-6"
                    style={{ color: "var(--red)" }}
                  />
                </div>
                <div>
                  <p
                    className="font-semibold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Error loading free books
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {error}
                  </p>
                </div>
                <button
                  onClick={fetchBooks}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
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
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <BookOpen
                  className="w-12 h-12 mb-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <h3
                  className="text-lg font-semibold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  No free books published yet
                </h3>
                <p
                  className="text-sm max-w-sm mb-6"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Use the publish tab to upload books. Books you upload as Admin are visible to all users.
                </p>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: "var(--accent)",
                    color: "#0e0e0f",
                    boxShadow: "0 4px 16px var(--accent-glow)",
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Publish First Book
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p
                  className="font-medium text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  No books match &quot;{query}&quot;
                </p>
              </div>
            ) : (
              /* Books Table / Cards */
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          background: "var(--bg-raised)",
                        }}
                      >
                        <th
                          className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Book Details
                        </th>
                        <th
                          className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Author
                        </th>
                        <th
                          className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider hidden md:table-cell"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Pages
                        </th>
                        <th
                          className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-right"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {filtered.map((book) => (
                        <tr
                          key={book.id}
                          className="transition-colors hover:bg-[var(--bg-hover)]"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-12 rounded overflow-hidden shrink-0 flex items-center justify-center"
                                style={{
                                  background: "var(--bg-hover)",
                                  border: "1px solid var(--border-subtle)",
                                }}
                              >
                                {book.coverUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={book.coverUrl}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FileText
                                    className="w-4 h-4"
                                    style={{ color: "var(--text-muted)" }}
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div
                                  className="text-sm font-semibold truncate"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {book.title}
                                </div>
                                <div
                                  className="text-xs truncate sm:hidden"
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  {book.author || "Unknown author"}
                                </div>
                                <span
                                  className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5"
                                  style={{
                                    background: "rgba(52,211,153,0.15)",
                                    color: "var(--emerald)",
                                  }}
                                >
                                  FREE FEED
                                </span>
                              </div>
                            </div>
                          </td>

                          <td
                            className="py-3.5 px-4 text-sm hidden sm:table-cell"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {book.author || "—"}
                          </td>

                          <td
                            className="py-3.5 px-4 text-sm hidden md:table-cell"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {book.totalPages ? `${book.totalPages} p.` : "—"}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => router.push(`/reader/${book.id}`)}
                                className="h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all duration-200"
                                style={{
                                  background: "var(--accent-dim)",
                                  color: "var(--accent)",
                                  border: "1px solid rgba(232,160,69,0.25)",
                                }}
                                title="Open in reader"
                                id={`admin-read-${book.id}`}
                              >
                                <BookOpen className="w-3 h-3" />
                                <span className="hidden sm:inline">Read</span>
                              </button>

                              <button
                                onClick={() => setEditingBook(book)}
                                className="h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all duration-200"
                                style={{
                                  background: "var(--bg-raised)",
                                  border: "1px solid var(--border-default)",
                                  color: "var(--text-secondary)",
                                }}
                                title="Edit details"
                                id={`admin-edit-${book.id}`}
                              >
                                <Pencil className="w-3 h-3" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>

                              <button
                                onClick={() => handleDelete(book)}
                                disabled={deletingId === book.id}
                                className="h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all duration-200 text-red-400 hover:bg-red-500/10"
                                style={{
                                  border: "1px solid rgba(248,113,113,0.25)",
                                }}
                                title="Delete from free books"
                                id={`admin-delete-${book.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                                <span className="hidden sm:inline">
                                  {deletingId === book.id ? "…" : "Delete"}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upload / Publish */}
        {activeTab === "upload" && (
          <div className="max-w-2xl mx-auto animate-fade-up">
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <h2
                    className="font-serif text-2xl"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Publish to Free Books
                  </h2>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(52,211,153,0.18)",
                      color: "var(--emerald)",
                      border: "1px solid rgba(52,211,153,0.3)",
                    }}
                  >
                    Public
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  As an Admin, books uploaded here are assigned the source{" "}
                  <code className="text-[11px] text-[var(--accent)]">
                    ADMIN_UPLOAD
                  </code>{" "}
                  by the server and become immediately accessible to all users on the Free Books feed.
                </p>
              </div>

              <UploadBookForm redirectTo="/admin" />
            </div>
          </div>
        )}
      </main>

      {/* Edit Book Dialog */}
      {editingBook && (
        <EditBookDialog
          open={!!editingBook}
          onClose={() => setEditingBook(null)}
          bookId={editingBook.id}
          initialTitle={editingBook.title}
          initialAuthor={editingBook.author ?? ""}
          onUpdated={() => {
            fetchBooks();
            setEditingBook(null);
          }}
        />
      )}
    </div>
  );
}
