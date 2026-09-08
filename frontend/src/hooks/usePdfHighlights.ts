"use client";

import { useState, useCallback, useEffect } from "react";
import type { Highlight, HighlightColor, CreateHighlightRequest } from "@/types/highlight";
import { highlightService } from "@/services/highlight.service";
import { getApiErrorMessage } from "@/lib/api-client";
import { toast } from "@/components/ui/toaster";

export function usePdfHighlights(bookId: number) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all highlights for this book on mount / when bookId changes
  const fetchHighlights = useCallback(async () => {
    if (!bookId || isNaN(bookId)) return;
    setIsLoading(true);
    try {
      const data = await highlightService.getHighlights(bookId);
      setHighlights(data);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      toast({
        title: "Couldn't load highlights",
        description: msg,
        variant: "destructive",
      });
      // Keep reader usable — just no highlights shown
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    setHighlights([]); // Clear when bookId changes
    fetchHighlights();
  }, [bookId, fetchHighlights]);

  /**
   * Create a highlight with optimistic UI update.
   * Renders instantly (0ms) so the user experiences zero latency,
   * then updates the temporary ID with the real ID from the backend.
   */
  const addHighlight = useCallback(
    async (request: CreateHighlightRequest): Promise<Highlight | null> => {
      // Optimistic highlight with a unique temporary negative ID
      const tempId = -Date.now();
      const optimisticHighlight: Highlight = {
        id: tempId,
        bookId: request.bookId,
        pageNumber: request.pageNumber,
        selectedText: request.selectedText,
        color: request.color,
        rectangles: request.rectangles,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to state immediately (0ms visual latency)
      setHighlights((prev) => [...prev, optimisticHighlight]);

      try {
        const saved = await highlightService.createHighlight(request);
        // Swap out the temporary optimistic highlight with the persisted server highlight
        setHighlights((prev) =>
          prev.map((h) => (h.id === tempId ? saved : h))
        );
        return saved;
      } catch (err) {
        // Rollback optimistic highlight
        setHighlights((prev) => prev.filter((h) => h.id !== tempId));
        const msg = getApiErrorMessage(err);
        toast({
          title: "Failed to save highlight",
          description: msg,
          variant: "destructive",
        });
        return null;
      }
    },
    []
  );

  /**
   * Delete a highlight with optimistic UI update.
   * Removes instantly from the screen, reverts if API call fails.
   */
  const removeHighlight = useCallback(
    async (highlightId: number) => {
      let previousHighlight: Highlight | undefined;
      setHighlights((prev) => {
        previousHighlight = prev.find((h) => h.id === highlightId);
        return prev.filter((h) => h.id !== highlightId);
      });

      try {
        await highlightService.deleteHighlight(highlightId);
      } catch (err) {
        // Rollback
        if (previousHighlight) {
          setHighlights((prev) => [...prev, previousHighlight!]);
        }
        const msg = getApiErrorMessage(err);
        toast({
          title: "Failed to delete highlight",
          description: msg,
          variant: "destructive",
        });
      }
    },
    []
  );

  /**
   * Change the color of a highlight via API.
   * Uses optimistic update — reverts on failure.
   */
  const changeColor = useCallback(
    async (highlightId: number, color: HighlightColor) => {
      // Optimistic update
      const previous = highlights.find((h) => h.id === highlightId);
      setHighlights((prev) =>
        prev.map((h) => (h.id === highlightId ? { ...h, color } : h))
      );
      try {
        const updated = await highlightService.updateHighlightColor(
          highlightId,
          color
        );
        setHighlights((prev) =>
          prev.map((h) => (h.id === highlightId ? updated : h))
        );
      } catch (err) {
        // Revert optimistic update
        if (previous) {
          setHighlights((prev) =>
            prev.map((h) => (h.id === highlightId ? previous : h))
          );
        }
        const msg = getApiErrorMessage(err);
        toast({
          title: "Failed to change highlight color",
          description: msg,
          variant: "destructive",
        });
      }
    },
    [highlights]
  );

  return {
    highlights,
    isLoading,
    addHighlight,
    removeHighlight,
    changeColor,
  };
}
