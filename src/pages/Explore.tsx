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
    <section className="min-h-full bg-[#0b2545] px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8da9c4]">Explore</p>
          <h1 className="text-4xl font-bold text-[#eef4ed]">Find your next watch</h1>
          <p className="text-sm text-[#8da9c4]">Browse the catalog with quick genre filters and the same movie feed from the home page.</p>
        </div>

        <GenreFilter selected={selectedGenre} onSelect={setSelectedGenre} />

        {loading && <p className="text-base text-[#eef4ed]">Завантаження...</p>}
        {error && <p className="text-base text-[#eef4ed]">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} className="h-full" imageClassName="h-48" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
