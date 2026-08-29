"use client";

import { useState, useCallback, useRef } from "react";
import type { ReaderBookResponse, ReadingProgressResponse } from "@/types/reader";
import { readerService } from "@/services/reader.service";
import { getApiErrorMessage } from "@/lib/api-client";

const PROGRESS_DEBOUNCE_MS = 1500;

export function useReader(bookId: number) {
  const [book, setBook] = useState<ReaderBookResponse | null>(null);
  const [progress, setProgress] = useState<ReadingProgressResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setErrorStatus(null);
    try {
      const [bookData, progressData] = await Promise.all([
        readerService.getBookForReading(bookId),
        readerService.getProgress(bookId),
      ]);
      setBook(bookData);
      setProgress(progressData);
      setCurrentPage(progressData.currentPage || 1);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const axiosErr = err as { response?: { status?: number } };
        setErrorStatus(axiosErr.response?.status ?? null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  const navigatePage = useCallback(
    (page: number) => {
      if (!book) return;
      const total = book.totalPages ?? 9999;
      const clamped = Math.max(1, Math.min(page, total));
      setCurrentPage(clamped);

      // Debounced progress save
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        try {
          const updated = await readerService.updateProgress(bookId, clamped);
          setProgress(updated);
        } catch {
          // silently fail — progress will sync on next load
        }
      }, PROGRESS_DEBOUNCE_MS);
    },
    [book, bookId]
  );

  return {
    book,
    progress,
    currentPage,
    isLoading,
    error,
    errorStatus,
    initialize,
    navigatePage,
  };
}
