export interface BookResponse {
  id: number;
  title: string;
  author: string | null;
  description: string | null;
  coverUrl: string | null;
  isbn: string | null;
  language: string | null;
  source: string | null;
  totalPages: number | null;
}

export interface BookRequest {
  title: string;
  author?: string;
  description?: string;
}

export interface UploadBookRequest {
  file: File;
  title: string;
  author?: string;
}
