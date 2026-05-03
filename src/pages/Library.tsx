import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bookmark, CheckCircle2, Heart } from "lucide-react";
import { getFavoriteMovies, getLikedMovies, getViewedMovies } from "@/api/library";
import type { Movie } from "@/api/movies";
import { MovieCard } from "@/components/MovieCard";
import { useMovieInteractionStates } from "@/features/interactions/useMovieInteractionStates";
import { cn } from "@/utils/cn";

const LIBRARY_TABS = ["Favorites", "Watched", "Liked"] as const;

type LibraryTab = (typeof LIBRARY_TABS)[number];

type LibraryCollections = Record<LibraryTab, Movie[]>;

const EMPTY_TEXT: Record<LibraryTab, string> = {
  Favorites: "Тут будуть твої улюблені фільми.",
  Watched: "Переглянуті фільми зявляться тут.",
  Liked: "Лайкнуті фільми зявляться тут.",
};

export function Library() {
  const [collections, setCollections] = useState<LibraryCollections>({
    Favorites: [],
    Watched: [],
    Liked: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LibraryTab>("Favorites");

  const allMovies = useMemo(() => {
    const movieMap = new Map<number, Movie>();
    for (const movies of Object.values(collections)) {
      for (const movie of movies) {
        if (!movieMap.has(movie.id)) {
          movieMap.set(movie.id, movie);
        }
      }
    }
    return Array.from(movieMap.values());
  }, [collections]);

  const { interactionStates, setInteractionState } = useMovieInteractionStates(
    allMovies.map((movie) => movie.id),
  );

  useEffect(() => {
    let isMounted = true;

    const loadLibrary = async () => {
      try {
        setLoading(true);
        setError(null);

        const [favoritesResult, viewedResult, likedResult] = await Promise.all([
          getFavoriteMovies(),
          getViewedMovies(),
          getLikedMovies(),
        ]);

        if (!isMounted) {
          return;
        }

        setCollections({
          Favorites: favoritesResult.items,
          Watched: viewedResult.items,
          Liked: likedResult.items,
        });
      } catch (loadError) {
        console.error("Failed to load library movies", loadError);
        if (isMounted) {
          setError("Не вдалося завантажити бібліотеку");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadLibrary();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleMovies = useMemo(() => {
    const tabMovies = collections[activeTab];

    return tabMovies.filter((movie) => {
      const state = interactionStates[movie.id];
      if (!state) {
        return true;
      }

      switch (activeTab) {
        case "Favorites":
          return state.favorite;
        case "Watched":
          return state.viewed;
        case "Liked":
          return state.liked;
        default:
          return true;
      }
    });
  }, [activeTab, collections, interactionStates]);

  const tabIcons: Record<LibraryTab, ReactNode> = {
    Favorites: <Bookmark className="h-4 w-4" aria-hidden="true" />,
    Watched: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
    Liked: <Heart className="h-4 w-4" aria-hidden="true" />,
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
              Favorites, watched movies, and liked picks stay close in one cinematic shelf.
            </p>
          </div>
          <div className="glass w-fit rounded-full px-4 py-2 text-sm font-semibold text-[#eef4ed]">
            {visibleMovies.length} titles
          </div>
        </div>

        <div className="glass flex w-fit flex-wrap gap-1 rounded-full p-1.5 shadow-[0_16px_40px_rgba(4,15,27,0.18)]">
          {LIBRARY_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                activeTab === tab
                  ? "bg-[linear-gradient(135deg,#eef4ed,#8da9c4)] text-[#0b2545] shadow-[0_14px_35px_rgba(19,64,116,0.2)]"
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

        {!loading && !error && visibleMovies.length === 0 && (
          <p className="glass w-fit rounded-full px-5 py-3 text-base font-medium text-[#eef4ed]">
            {EMPTY_TEXT[activeTab]}
          </p>
        )}

        {!loading && !error && visibleMovies.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
            {visibleMovies.map((movie) => (
              <MovieCard
                key={`${activeTab}-${movie.id}`}
                movie={movie}
                interactionState={interactionStates[movie.id]}
                onInteractionStateChange={setInteractionState}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
