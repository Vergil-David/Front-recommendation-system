import { apiClient } from "@/api/client";

export type Book = {
  id: number;
  title: string;
  description: string;
  release_year: number;
  image_url: string;
  genres?: string[];
  metadata?: Record<string, unknown>;
};

export type BooksResponse = {
  items: Book[];
  total: number;
  page: number;
  limit: number;
};

export const getBooks = async (
  page = 1,
  limit = 20,
  sort?: "random",
  genre?: string,
): Promise<BooksResponse> => {
  const response = await apiClient.get<BooksResponse>("/books", {
    params: {
      page,
      limit,
      ...(sort ? { sort } : {}),
      ...(genre ? { genre } : {}),
    },
  });
  return response.data;
};

export const getBookById = async (bookId: string | number): Promise<Book> => {
  const response = await apiClient.get<Book>(`/books/${encodeURIComponent(String(bookId))}`);
  return response.data;
};

export const getBookGenres = async (): Promise<string[]> => {
  const response = await apiClient.get<{ genres: string[] }>("/books/genres");
  return response.data.genres;
};
