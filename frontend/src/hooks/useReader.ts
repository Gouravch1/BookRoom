"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  const pendingPageRef = useRef<number | null>(null);

  // Flush any pending progress save on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (pendingPageRef.current !== null) {
        readerService.updateProgress(bookId, pendingPageRef.current).catch(() => {});
      }
    };
  }, [bookId]);

  const initialize = useCallback(
    async (initialPageOverride?: number) => {
      setIsLoading(true);
      setError(null);
      setErrorStatus(null);
      try {
        const [bookData, progressData] = await Promise.all([
          readerService.getBookForReading(bookId),
          readerService.getProgress(bookId),
        ]);
        setBook(bookData);

        const startingPage =
          initialPageOverride && initialPageOverride >= 1
            ? initialPageOverride
            : progressData.currentPage || 1;

        setCurrentPage(startingPage);
        setProgress(progressData);

        // If user explicitly overrode the page (e.g. Restart from page 1)
        // or if opening for the first time without recorded lastReadAt
        if (
          initialPageOverride ||
          !progressData.lastReadAt ||
          (progressData.progressPercent ?? 0) === 0
        ) {
          readerService
            .updateProgress(bookId, startingPage)
            .then((updated) => {
              setProgress(updated);
            })
            .catch(() => {});
        }
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
    },
    [bookId]
  );

  const saveProgressImmediate = useCallback(
    async (page: number) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      pendingPageRef.current = null;
      setCurrentPage(page);
      try {
        const updated = await readerService.updateProgress(bookId, page);
        setProgress(updated);
        return updated;
      } catch {
        return null;
      }
    },
    [bookId]
  );

  const navigatePage = useCallback(
    (page: number, maxPagesOverride?: number) => {
      if (!book) return;
      const total = Math.max(book.totalPages ?? 0, maxPagesOverride ?? 0) || 9999;
      const clamped = Math.max(1, Math.min(page, total));
      setCurrentPage(clamped);

      pendingPageRef.current = clamped;

      // Debounced progress save
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        try {
          const updated = await readerService.updateProgress(bookId, clamped);
          setProgress(updated);
          pendingPageRef.current = null;
        } catch {
          // silently fail — progress will sync on next load or flush
        }
      }, PROGRESS_DEBOUNCE_MS);
    },
    [book, bookId]
  );

  const completeBook = useCallback(async (maxPagesOverride?: number) => {
    if (!book) return null;
    const total = Math.max(book.totalPages ?? 0, maxPagesOverride ?? 0) || currentPage;
    return await saveProgressImmediate(total);
  }, [book, currentPage, saveProgressImmediate]);

  return {
    book,
    progress,
    currentPage,
    isLoading,
    error,
    errorStatus,
    initialize,
    navigatePage,
    saveProgressImmediate,
    completeBook,
  };
}
