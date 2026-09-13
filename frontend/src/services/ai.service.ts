import { apiClient } from "@/lib/api-client";

export interface AiResponse {
  response: string;
}

export const aiService = {
  /**
   * Explain a piece of selected text.
   * POST /api/ai/explain
   */
  async explainText(selectedText: string): Promise<AiResponse> {
    const res = await apiClient.post<AiResponse>("/api/ai/explain", {
      message: selectedText,
    });
    return res.data;
  },

  /**
   * Summarize a piece of selected text.
   * POST /api/ai/summarize
   */
  async summarizeText(selectedText: string): Promise<AiResponse> {
    const res = await apiClient.post<AiResponse>("/api/ai/summarize", {
      message: selectedText,
    });
    return res.data;
  },

  /**
   * Explain the current page of a book.
   * POST /api/ai/page/explain
   */
  async explainPage(bookId: number, pageNumber: number): Promise<AiResponse> {
    const res = await apiClient.post<AiResponse>("/api/ai/page/explain", {
      bookId,
      pageNumber,
    });
    return res.data;
  },

  /**
   * General AI chat.
   * POST /api/ai/chat
   */
  async chat(message: string): Promise<AiResponse> {
    const res = await apiClient.post<AiResponse>("/api/ai/chat", { message });
    return res.data;
  },
};
