import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Info, Plus } from "lucide-react";
import { getMovies, type Movie } from "@/api/movies";
import {
  createInteraction,
  getFriendRecommendations,
  getRecommendations,
  type FriendRecommendation,
} from "@/api/recommendations";
import { HeroBanner } from "@/components/HeroBanner";
import { RowSection } from "@/components/RowSection";

export function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [friendRecommendedMovies, setFriendRecommendedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        const [moviesResult, recommendationsResult, friendRecommendationsResult] =
          await Promise.allSettled([
            getMovies(1, 20),
            getRecommendations(20),
            getFriendRecommendations(20),
          ]);

        if (moviesResult.status === "rejected") {
          throw moviesResult.reason;
        }

        const movieItems = moviesResult.value.items;
        const movieById = new Map(movieItems.map((movie) => [movie.id, movie] as const));

        const personalizedMovies =
          recommendationsResult.status === "fulfilled" ? recommendationsResult.value.items : [];
        const fallbackRecommendedMovies = movieItems.slice(0, 20);
        const friendRecommendationItems =
          friendRecommendationsResult.status === "fulfilled"
            ? friendRecommendationsResult.value.items
            : [];

        if (isMounted) {
          setMovies(movieItems);
          setRecommendedMovies(
            personalizedMovies.length > 0 ? personalizedMovies : fallbackRecommendedMovies,
          );
          setFriendRecommendedMovies(
            friendRecommendationItems
              .map((item) => movieById.get(item.id) ?? createFriendRecommendationPlaceholder(item))
              .slice(0, 20),
          );
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

  const heroMovie = movies[0];
  const popularMovies = movies.slice(0, 20);
  const recordHeroView = () => {
    if (!heroMovie) {
      return;
    }

    void createInteraction(heroMovie.id, "viewed").catch((error) => {
      console.error("Failed to record hero movie view", error);
    });
  };

  return (
    <section className="min-h-screen pb-20">
      {loading && (
        <div className="flex min-h-screen items-center justify-center px-4 md:px-8">
          <p className="glass rounded-full px-5 py-3 text-base font-medium text-[#eef4ed]">
            Завантаження...
          </p>
        </div>
      )}

      {error && (
        <div className="flex min-h-screen items-center justify-center px-4 md:px-8">
          <p className="glass rounded-full px-5 py-3 text-base font-medium text-[#eef4ed]">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && heroMovie && (
        <>
          <HeroBanner
            movie={heroMovie}
            actions={
              <>
                <Link
                  to={`/movies/${heroMovie.id}`}
                  onClick={recordHeroView}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#eef4ed] px-6 py-3 text-sm font-semibold text-[#0b2545] shadow-[0_18px_45px_rgba(0,0,0,0.25)] transition duration-300 hover:scale-105 hover:bg-[#eef4ed]/90"
                >
                  <Info className="h-4 w-4" aria-hidden="true" />
                  Read More
                </Link>
                <Link
                  to="/library"
                  className="glass inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-[#eef4ed] transition duration-300 hover:scale-105 hover:bg-[#134074]/80"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add to Library
                </Link>
              </>
            }
          />

          <div className="relative z-10 mx-auto -mt-12 max-w-[1440px] space-y-12 px-4 pt-4 md:px-8">
            <RowSection title="Recommended" movies={recommendedMovies} />
            <RowSection
              title="Recommended by friends"
              movies={friendRecommendedMovies}
              emptyText="Додай друзів або лайкни фільми, щоб побачити рекомендації від друзів."
            />
            <RowSection title="Popular" movies={popularMovies} />
          </div>
        </>
      )}
    </section>
  );
}

function createFriendRecommendationPlaceholder(item: FriendRecommendation): Movie {
  return {
    id: item.id,
    title: item.title,
    description: item.reason,
    release_year: 0,
    image_url: "",
  };
}
