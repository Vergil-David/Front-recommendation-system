import { useEffect, useMemo, useState } from "react";
import { getMovies, type Movie } from "@/api/movies";
import { MovieCard } from "@/components/MovieCard";
import { cn } from "@/utils/cn";

const LIBRARY_TABS = ["Watching", "Completed", "Wishlist"] as const;

type LibraryTab = (typeof LIBRARY_TABS)[number];

export function Library() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LibraryTab>("Watching");

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

  const moviesByTab = useMemo<Record<LibraryTab, Movie[]>>(
    () => ({
      Watching: movies.slice(0, 6),
      Completed: movies.slice(6, 12),
      Wishlist: movies.slice(12, 18),
    }),
    [movies],
  );

  return (
    <section className="min-h-full bg-[#0b2545] px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8da9c4]">My Library</p>
          <h1 className="text-4xl font-bold text-[#eef4ed]">Keep your watchlist organized</h1>
          <p className="text-sm text-[#8da9c4]">Switch between active, completed, and saved titles without leaving the existing app flow.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {LIBRARY_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "bg-[#eef4ed] text-[#0b2545]"
                  : "bg-[#13315c] text-[#8da9c4] hover:bg-[#134074] hover:text-[#eef4ed]",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && <p className="text-base text-[#eef4ed]">Завантаження...</p>}
        {error && <p className="text-base text-[#eef4ed]">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {moviesByTab[activeTab].map((movie) => (
              <MovieCard key={`${activeTab}-${movie.id}`} movie={movie} imageClassName="h-48" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
