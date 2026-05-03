import { apiClient } from "@/api/client";

export type Movie = {
  id: number;
  title: string;
  description: string;
  release_year: number;
  image_url: string;
  metadata?: Record<string, unknown>;
};

export type MoviesResponse = {
  items: Movie[];
  total: number;
  page: number;
  limit: number;
};

export const getMovies = async (page = 1, limit = 20): Promise<MoviesResponse> => {
  const response = await apiClient.get<MoviesResponse>("/movies", {
    params: { page, limit },
  });

  return response.data;
};

export const getMovieById = async (movieId: string | number): Promise<Movie> => {
  const response = await apiClient.get<Movie>(`/movies/${encodeURIComponent(String(movieId))}`);

  return response.data;
};
