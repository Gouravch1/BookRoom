"use client";

import { useState, useCallback } from "react";
import type { LibraryBookResponse } from "@/types/library";
import { libraryService } from "@/services/library.service";
import { getApiErrorMessage } from "@/lib/api-client";

export function useLibrary() {
  const [library, setLibrary] = useState<LibraryBookResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLibrary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await libraryService.getMyLibrary();
      setLibrary(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFromLibrary = useCallback(
    async (bookId: number) => {
      await libraryService.removeFromLibrary(bookId);
      // Optimistic update
      setLibrary((prev) => prev.filter((item) => item.bookId !== bookId));
    },
    []
  );

  return { library, isLoading, error, fetchLibrary, removeFromLibrary };
}
