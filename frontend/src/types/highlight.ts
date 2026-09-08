export type HighlightColor =
  | "YELLOW"
  | "GREEN"
  | "RED"
  | "BLUE"
  | "PINK"
  | "ORANGE"
  | "BLACK";

export interface HighlightRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Highlight {
  id: number;
  bookId: number;
  pageNumber: number;
  selectedText: string | null;
  color: HighlightColor;
  rectangles: HighlightRectangle[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateHighlightRequest {
  bookId: number;
  pageNumber: number;
  selectedText: string;
  color: HighlightColor;
  rectangles: HighlightRectangle[];
}
