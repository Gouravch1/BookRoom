import { apiClient, multipartConfig } from "@/lib/api-client";
import type { BookResponse, BookRequest, UploadBookRequest } from "@/types/book";

export const bookService = {
  async uploadBook(data: UploadBookRequest): Promise<BookResponse> {
    const form = new FormData();
    form.append("file", data.file);
    form.append("title", data.title);
    if (data.author) form.append("author", data.author);

    const res = await apiClient.post<BookResponse>(
      "/api/books/upload",
      form,
      multipartConfig()
    );
    return res.data;
  },

  async getMyBooks(): Promise<BookResponse[]> {
    const res = await apiClient.get<BookResponse[]>("/api/books/my-books");
    return res.data;
  },

  async getMyBookById(id: number): Promise<BookResponse> {
    const res = await apiClient.get<BookResponse>(`/api/books/my-books/${id}`);
    return res.data;
  },

  async updateBook(id: number, data: BookRequest): Promise<BookResponse> {
    const res = await apiClient.put<BookResponse>(
      `/api/books/my-books/${id}`,
      data
    );
    return res.data;
  },

  async deleteBook(id: number): Promise<void> {
    await apiClient.delete(`/api/books/my-books/${id}`);
  },
};
