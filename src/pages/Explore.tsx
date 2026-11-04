import { useEffect, useRef, useState } from "react";
import { getMovies, getMovieGenres, type Movie } from "@/api/movies";
import { getRecommendations } from "@/api/recommendations";
import { MovieCard } from "@/components/MovieCard";
import { useMovieInteractionStates } from "@/features/interactions/useMovieInteractionStates";
import { cn } from "@/utils/cn";

const PAGE_LIMIT = 48;

function mergeUnique(primary: Movie[], secondary: Movie[]): Movie[] {
  const seen = new Set<number>();
  const result: Movie[] = [];
  for (const m of [...primary, ...secondary]) {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      result.push(m);
    }
  }
  return result;
}

export function Explore() {
  const [allMovies, setAllMovies]     = useState<Movie[]>([]);
  const [genres, setGenres]           = useState<string[]>([]);
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState("All");

  const seenIds = useRef<Set<number>>(new Set());

  const { interactionStates, setInteractionState } = useMovieInteractionStates(
    allMovies.map((m) => m.id),
  );

  // Load genres once on mount
  useEffect(() => {
    getMovieGenres().then(setGenres).catch(() => {});
  }, []);

  // Reload movies when genre changes
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setAllMovies([]);
    setPage(1);
    setTotal(0);
    seenIds.current = new Set();

    const activeGenre = selectedGenre === "All" ? undefined : selectedGenre;

    const load = async () => {
      const [recsResult, catalogResult] = await Promise.allSettled([
        activeGenre ? Promise.resolve(null) : getRecommendations(30),
        getMovies(1, PAGE_LIMIT, "random", activeGenre),
      ]);

      if (!mounted) return;

      if (catalogResult.status === "rejected") {
        setError("Не вдалося завантажити фільми");
        setLoading(false);
        return;
      }

      const catalog = catalogResult.value;
      const recs =
        !activeGenre && recsResult.status === "fulfilled" && recsResult.value
          ? recsResult.value.items
          : [];

      const merged = mergeUnique(recs, catalog.items);
      for (const m of merged) seenIds.current.add(m.id);

      setAllMovies(merged);
      setTotal(catalog.total);
      setPage(catalog.page);
      setLoading(false);
    };

    void load();
    return () => { mounted = false; };
  }, [selectedGenre]);

  const loadMore = async () => {
    if (loadingMore || allMovies.length >= total) return;
    setLoadingMore(true);
    const activeGenre = selectedGenre === "All" ? undefined : selectedGenre;
    try {
      const data = await getMovies(page + 1, PAGE_LIMIT, "random", activeGenre);
      const fresh = data.items.filter((m) => !seenIds.current.has(m.id));
      for (const m of fresh) seenIds.current.add(m.id);
      setAllMovies((prev) => [...prev, ...fresh]);
      setPage(data.page);
      setTotal(data.total);
    } catch {
      // non-fatal
    } finally {
      setLoadingMore(false);
    }
  };

  // No client-side filtering — backend already filters by genre
  const filteredMovies = allMovies;

  const hasMore = allMovies.length < total;

  return (
    <section className="min-h-screen px-4 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-[1440px] space-y-9">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8da9c4]">
              Каталог
            </p>
            <h1 className="font-display text-4xl font-bold text-[#eef4ed] md:text-5xl">
              Знайди свій наступний фільм
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[#8da9c4]">
              Переглядай кінокаталог, відфільтрований за жанрами.
            </p>
          </div>
          <div className="glass w-fit rounded-full px-4 py-2 text-sm font-semibold text-[#eef4ed]">
            {filteredMovies.length}{hasMore && selectedGenre === "All" ? ` / ${total}` : ""} назв
          </div>
        </div>

        {/* Genre filter */}
        {genres.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8da9c4]">
              Фільтри
            </p>
            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedGenre("All")}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-300 hover:scale-105",
                  selectedGenre === "All"
                    ? "bg-[#eef4ed] text-[#0b2545]"
                    : "glass text-[#8da9c4] hover:bg-[#134074]/80 hover:text-[#eef4ed]",
                )}
              >
                Всі
              </button>
              {genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-300 hover:scale-105",
                    selectedGenre === genre
                      ? "bg-[#eef4ed] text-[#0b2545]"
                      : "glass text-[#8da9c4] hover:bg-[#134074]/80 hover:text-[#eef4ed]",
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* States */}
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

        {/* Grid */}
        {!loading && !error && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
              {filteredMovies.map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  className="h-full"
                  priority={index < 12}
                  interactionState={interactionStates[movie.id]}
                  onInteractionStateChange={setInteractionState}
                />
              ))}
            </div>

            {hasMore && selectedGenre === "All" && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#1d4f8b,#13315c)] px-6 py-3 text-sm font-semibold text-[#eef4ed] shadow-[0_18px_45px_rgba(4,15,27,0.28)] transition duration-300 hover:scale-105 hover:shadow-[0_24px_55px_rgba(19,64,116,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingMore ? "Завантаження..." : "Завантажити ще"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
