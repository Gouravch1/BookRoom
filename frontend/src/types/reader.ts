export interface ReaderBookResponse {
  bookId: number;
  title: string;
  author: string | null;
  pdfUrl: string;
  totalPages: number | null;
}

export interface ReadingProgressResponse {
  bookId: number;
  currentPage: number;
  totalPages: number | null;
  progressPercent: number | null;
  lastReadAt: string | null;
}
