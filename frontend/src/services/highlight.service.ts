import { apiClient } from "@/lib/api-client";
import type {
  Highlight,
  CreateHighlightRequest,
  HighlightColor,
} from "@/types/highlight";

// In-flight / resolved promise cache per bookId
const highlightsPromiseCache = new Map<number, Promise<Highlight[]>>();

export const highlightService = {
  /**
   * Fetch all highlights for the current authenticated user for a given book.
   * Uses an in-flight promise cache to enable parallel prefetching.
   * GET /api/highlights/book/{bookId}
   */
  getHighlights(bookId: number, forceRefresh = false): Promise<Highlight[]> {
    if (!forceRefresh && highlightsPromiseCache.has(bookId)) {
      return highlightsPromiseCache.get(bookId)!;
    }

    const promise = apiClient
      .get<Highlight[]>(`/api/highlights/book/${bookId}`)
      .then((res) => res.data)
      .catch((err) => {
        // Remove from cache on failure so next attempt retries
        highlightsPromiseCache.delete(bookId);
        throw err;
      });

    highlightsPromiseCache.set(bookId, promise);
    return promise;
  },

  /**
   * Prefetch highlights early in page lifecycle (runs parallel with book metadata).
   */
  prefetchHighlights(bookId: number): void {
    if (!bookId || isNaN(bookId)) return;
    this.getHighlights(bookId).catch(() => {});
  },

  /**
   * Invalidate highlights cache for a book (e.g. on unmount or refresh).
   */
  invalidateCache(bookId?: number): void {
    if (bookId) {
      highlightsPromiseCache.delete(bookId);
    } else {
      highlightsPromiseCache.clear();
    }
  },

  /**
   * Create a new highlight.
   * POST /api/highlights
   */
  async createHighlight(data: CreateHighlightRequest): Promise<Highlight> {
    const res = await apiClient.post<Highlight>("/api/highlights", data);
    return res.data;
  },

  /**
   * Delete an entire highlight (all its rectangles).
   * DELETE /api/highlights/{highlightId}
   */
  async deleteHighlight(highlightId: number): Promise<void> {
    await apiClient.delete(`/api/highlights/${highlightId}`);
  },

  /**
   * Change the color of an existing highlight.
   * PATCH /api/highlights/{highlightId}/color?color=GREEN
   */
  async updateHighlightColor(
    highlightId: number,
    color: HighlightColor
  ): Promise<Highlight> {
    const res = await apiClient.patch<Highlight>(
      `/api/highlights/${highlightId}/color`,
      null,
      { params: { color } }
    );
    return res.data;
  },
};
