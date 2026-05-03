import { apiClient } from "@/api/client";
import type { Movie } from "@/api/movies";

export type LibraryMoviesResponse = {
  items: Movie[];
};

const getLibraryMovies = async (path: string) => {
  const response = await apiClient.get<LibraryMoviesResponse>(path);
  return response.data;
};

export const getFavoriteMovies = async () => getLibraryMovies("/library/favorites");

export const getViewedMovies = async () => getLibraryMovies("/library/viewed");

export const getLikedMovies = async () => getLibraryMovies("/library/liked");
