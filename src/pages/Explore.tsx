import { useEffect, useMemo, useState } from "react";
import { getMovies, type Movie } from "@/api/movies";
import { GenreFilter, getMovieGenres } from "@/components/GenreFilter";
import { MovieCard } from "@/components/MovieCard";

export function Explore() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState("All");

  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMovies();

        if (isMounted) {
          setMovies(data.items);
        }
      } catch {
        if (isMounted) {
          setError("Не вдалося завантажити фільми");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMovies = useMemo(() => {
    if (selectedGenre === "All") {
      return movies;
    }

    return movies.filter((movie) => getMovieGenres(movie).includes(selectedGenre));
  }, [movies, selectedGenre]);

  return (
    <section className="min-h-screen px-4 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-[1440px] space-y-9">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8da9c4]">
              Explore
            </p>
            <h1 className="font-display text-4xl font-bold text-[#eef4ed] md:text-5xl">
              Find your next watch
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[#8da9c4]">
              Browse a cinematic catalog shaped around quick genre discovery.
            </p>
          </div>
          <div className="glass w-fit rounded-full px-4 py-2 text-sm font-semibold text-[#eef4ed]">
            {filteredMovies.length} titles
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8da9c4]">
            Filters
          </p>
          <GenreFilter selected={selectedGenre} onSelect={setSelectedGenre} />
        </div>

        {loading && (
          <p className="glass w-fit rounded-full px-5 py-3 text-base font-medium text-[#eef4ed]">
            Завантаження...
          </p>
        )}
        {error && (
          <p className="glass w-fit rounded-full px-5 py-3 text-base font-medium text-[#eef4ed]">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} className="h-full" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
