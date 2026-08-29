import { apiClient } from "@/lib/api-client";
import type {
  ReaderBookResponse,
  ReadingProgressResponse,
} from "@/types/reader";

export const readerService = {
  async getBookForReading(bookId: number): Promise<ReaderBookResponse> {
    const res = await apiClient.get<ReaderBookResponse>(
      `/api/reader/${bookId}/read`
    );
    return res.data;
  },

  async getProgress(bookId: number): Promise<ReadingProgressResponse> {
    const res = await apiClient.get<ReadingProgressResponse>(
      `/api/reader/${bookId}/progress`
    );
    return res.data;
  },

  async updateProgress(
    bookId: number,
    currentPage: number
  ): Promise<ReadingProgressResponse> {
    const res = await apiClient.patch<ReadingProgressResponse>(
      `/api/reader/${bookId}/progress`,
      null,
      { params: { currentPage } }
    );
    return res.data;
  },
};
