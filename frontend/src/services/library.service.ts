import { apiClient } from "@/lib/api-client";
import type { LibraryBookResponse } from "@/types/library";

export const libraryService = {
  async getMyLibrary(): Promise<LibraryBookResponse[]> {
    const res = await apiClient.get<LibraryBookResponse[]>("/api/library");
    return res.data;
  },

  async addToLibrary(bookId: number): Promise<LibraryBookResponse> {
    const res = await apiClient.post<LibraryBookResponse>(
      `/api/library/${bookId}`
    );
    return res.data;
  },

  async removeFromLibrary(bookId: number): Promise<void> {
    await apiClient.delete(`/api/library/${bookId}`);
  },
};
