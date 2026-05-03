import { useEffect, useMemo, useState } from "react";
import { getMovies, type Movie } from "@/api/movies";
import { GenreFilter, getMovieGenres } from "@/components/GenreFilter";
import { MovieCard } from "@/components/MovieCard";
import { useMovieInteractionStates } from "@/features/interactions/useMovieInteractionStates";

const PAGE_LIMIT = 50;

export function Explore() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { interactionStates, setInteractionState } = useMovieInteractionStates(
    movies.map((movie) => movie.id),
  );

  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMovies(1, PAGE_LIMIT);

        if (isMounted) {
          setMovies(data.items);
          setPage(data.page);
          setHasMore(data.page * data.limit < data.total);
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

  const loadMoreMovies = async () => {
    if (!hasMore || loadingMore) {
      return;
    }

    const nextPage = page + 1;

    try {
      setLoadingMore(true);
      const data = await getMovies(nextPage, PAGE_LIMIT);

      setMovies((current) => {
        const knownIds = new Set(current.map((movie) => movie.id));
        const nextMovies = data.items.filter((movie) => !knownIds.has(movie.id));
        return [...current, ...nextMovies];
      });
      setPage(data.page);
      setHasMore(data.page * data.limit < data.total);
    } catch (loadError) {
      console.error("Failed to load more movies", loadError);
    } finally {
      setLoadingMore(false);
    }
  };

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
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  className="h-full"
                  interactionState={interactionStates[movie.id]}
                  onInteractionStateChange={setInteractionState}
                />
              ))}
            </div>

            {hasMore ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadMoreMovies()}
                  disabled={loadingMore}
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#1d4f8b,#13315c)] px-6 py-3 text-sm font-semibold text-[#eef4ed] shadow-[0_18px_45px_rgba(4,15,27,0.28)] transition duration-300 hover:scale-105 hover:shadow-[0_24px_55px_rgba(19,64,116,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingMore ? "Завантаження..." : "Load more"}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
