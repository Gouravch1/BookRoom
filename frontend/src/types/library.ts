export interface LibraryBookResponse {
  libraryItemId: number;
  bookId: number;
  title: string;
  author: string | null;
  coverUrl: string | null;
  totalPages: number | null;
  currentPage: number | null;
  progressPercent: number | null;
  lastReadAt: string | null;
}
