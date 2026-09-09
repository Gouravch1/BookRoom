import { apiClient } from "@/lib/api-client";
import type {
  Highlight,
  CreateHighlightRequest,
  HighlightColor,
} from "@/types/highlight";

export const highlightService = {
  /**
   * Fetch all highlights for the current authenticated user for a given book.
   * GET /api/highlights/book/{bookId}
   */
  async getHighlights(bookId: number): Promise<Highlight[]> {
    const res = await apiClient.get<Highlight[]>(
      `/api/highlights/book/${bookId}`
    );
    return res.data;
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

  /**
   * Update or clear the note on an existing highlight.
   * PATCH /api/highlights/{highlightId}/note
   */
  async updateHighlightNote(
    highlightId: number,
    note: string | null
  ): Promise<Highlight> {
    const res = await apiClient.patch<Highlight>(
      `/api/highlights/${highlightId}/note`,
      { note }
    );
    return res.data;
  },
};

