import { apiClient } from "@/api/client";

export type SearchItem = {
  id: number;
  title: string;
  description: string;
  release_year: number;
  image_url: string;
  type: "movie" | "book";
  genres: string[];
  score: number;
};

export type SearchResponse = {
  items: SearchItem[];
  query: string;
  total: number;
};

export const searchItems = async (
  q: string,
  type?: "movie" | "book",
  limit = 30,
): Promise<SearchResponse> => {
  const response = await apiClient.get<SearchResponse>("/search", {
    params: { q, limit, ...(type ? { type } : {}) },
  });
  return response.data;
};
