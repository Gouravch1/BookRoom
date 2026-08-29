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
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle } from "lucide-react";

export default function LibraryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { library, isLoading, error, fetchLibrary, removeFromLibrary } =
    useLibrary();
  const [myBookIds, setMyBookIds] = useState<Set<number>>(new Set());

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch library and owned book IDs
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <LibraryHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Page title row */}
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
              My Library
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Your personal reading collection
            </p>
          </div>
          <Link href="/books/upload">
            <Button size="sm" id="upload-book-button">
              <Upload className="w-3.5 h-3.5" />
              Upload Book
            </Button>
          </Link>
        </div>

        {/* States */}
        {isLoading ? (
          <LibrarySkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-stone-700 font-medium">
              Failed to load your library
            </p>
            <p className="text-sm text-stone-500">{error}</p>
            <Button variant="outline" onClick={fetchLibrary} className="mt-1">
              Try again
            </Button>
          </div>
        ) : library.length === 0 ? (
          <LibraryEmpty />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
