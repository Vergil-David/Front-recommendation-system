import { apiClient } from "@/api/client";
import type { Movie } from "@/api/movies";

export type LibraryMoviesResponse = {
  items: Movie[];
};

const getLibraryMovies = async (path: string, type?: "movie" | "book") => {
  const response = await apiClient.get<LibraryMoviesResponse>(path, {
    params: type ? { type } : {},
  });
  return response.data;
};

export const getFavoriteMovies = async (type?: "movie" | "book") =>
  getLibraryMovies("/library/favorites", type);

export const getViewedMovies = async (type?: "movie" | "book") =>
  getLibraryMovies("/library/viewed", type);

export const getLikedMovies = async (type?: "movie" | "book") =>
  getLibraryMovies("/library/liked", type);
