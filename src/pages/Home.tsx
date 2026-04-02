import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
    <section className="min-h-full bg-[#0b2545] pb-10">
      {loading && (
        <div className="flex min-h-[60vh] items-center justify-center px-4 md:px-8">
          <p className="text-base text-[#eef4ed]">Завантаження...</p>
        </div>
      )}

      {error && (
        <div className="flex min-h-[60vh] items-center justify-center px-4 md:px-8">
          <p className="text-base text-[#eef4ed]">{error}</p>
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
                  className="rounded-full bg-[#eef4ed] px-6 py-3 text-sm font-semibold text-[#0b2545] transition hover:opacity-90"
                >
                  Read More
                </Link>
                <Link
                  to="/library"
                  className="rounded-full bg-[#134074] px-6 py-3 text-sm font-semibold text-[#eef4ed] transition hover:bg-[#13315c]"
                >
                  + Add to Library
                </Link>
              </>
            }
          />

          <div className="mx-auto mt-10 max-w-7xl space-y-10 px-4 md:px-8">
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
