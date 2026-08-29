"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { ReaderBookResponse } from "@/types/reader";
import type { ReadingProgressResponse } from "@/types/reader";
import { Progress } from "@/components/ui/progress";

interface ReaderHeaderProps {
  book: ReaderBookResponse;
  progress: ReadingProgressResponse | null;
  currentPage: number;
}

export function ReaderHeader({ book, progress, currentPage }: ReaderHeaderProps) {
  const total = book.totalPages ?? 0;
  const pct = total > 0 ? Math.round((currentPage / total) * 100) : 0;

  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3 px-4 h-12">
        {/* Back */}
        <Link
          href="/library"
          className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors text-sm shrink-0"
          id="back-to-library"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Library</span>
        </Link>

        <div className="w-px h-4 bg-stone-200 shrink-0" />

        {/* Book info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <BookOpen className="w-4 h-4 text-stone-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-900 truncate leading-tight">
              {book.title}
            </p>
            {book.author && (
              <p className="text-xs text-stone-400 truncate">{book.author}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        {total > 0 && (
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="w-20 lg:w-28">
              <Progress value={pct} className="h-1" />
            </div>
            <span className="text-xs text-stone-500 tabular-nums whitespace-nowrap">
              {currentPage} / {total}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
