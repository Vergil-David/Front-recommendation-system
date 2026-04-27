import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Info, Plus } from "lucide-react";
import { getMovies, type Movie } from "@/api/movies";
import { HeroBanner } from "@/components/HeroBanner";
import { RowSection } from "@/components/RowSection";

export function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const heroMovie = movies[0];
  const recommendedMovies = movies.slice(1, 11);
  const trendingMovies = movies.slice(4, 14);
  const becauseYouLikedMovies = movies.slice(2, 12);
  const popularMovies = [...movies].reverse().slice(0, 10);

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
            <RowSection title="Recommended For You" movies={recommendedMovies} />
            <RowSection title="Trending" movies={trendingMovies} />
            <RowSection title="Because You Liked" movies={becauseYouLikedMovies} />
            <RowSection title="Popular" movies={popularMovies} />
          </div>
        </>
      )}
    </section>
  );
}
