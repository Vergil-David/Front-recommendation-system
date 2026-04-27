import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bookmark, CheckCircle2, PlayCircle } from "lucide-react";
import { getMovies, type Movie } from "@/api/movies";
import { MovieCard } from "@/components/MovieCard";
import { cn } from "@/utils/cn";

const LIBRARY_TABS = ["Reading", "Completed", "Wishlist"] as const;

type LibraryTab = (typeof LIBRARY_TABS)[number];

export function Library() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LibraryTab>("Reading");

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
      Reading: movies.slice(0, 6),
      Completed: movies.slice(6, 12),
      Wishlist: movies.slice(12, 18),
    }),
    [movies],
  );

  const tabIcons: Record<LibraryTab, ReactNode> = {
    Reading: <PlayCircle className="h-4 w-4" aria-hidden="true" />,
    Completed: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
    Wishlist: <Bookmark className="h-4 w-4" aria-hidden="true" />,
  };

  return (
    <section className="min-h-screen px-4 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-[1440px] space-y-9">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8da9c4]">
              My Library
            </p>
            <h1 className="font-display text-4xl font-bold text-[#eef4ed] md:text-5xl">
              Your personal collection
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[#8da9c4]">
              Keep current, finished, and saved titles close at hand.
            </p>
          </div>
          <div className="glass w-fit rounded-full px-4 py-2 text-sm font-semibold text-[#eef4ed]">
            {moviesByTab[activeTab].length} titles
          </div>
        </div>

        <div className="glass flex w-fit flex-wrap gap-1 rounded-xl p-1">
          {LIBRARY_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                activeTab === tab
                  ? "bg-[#eef4ed] text-[#0b2545]"
                  : "text-[#8da9c4] hover:bg-[#134074]/70 hover:text-[#eef4ed]",
              )}
            >
              {tabIcons[tab]}
              {tab}
            </button>
          ))}
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
            {moviesByTab[activeTab].map((movie) => (
              <MovieCard key={`${activeTab}-${movie.id}`} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
