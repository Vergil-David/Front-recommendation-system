import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getMovies, type Movie } from "@/api/movies";
import { HeroBanner } from "@/components/HeroBanner";
import { RowSection } from "@/components/RowSection";

export function MovieDetails() {
  const { movieId } = useParams();
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

  const movie = useMemo(() => movies.find((item) => String(item.id) === movieId), [movieId, movies]);
  const relatedMovies = useMemo(() => movies.filter((item) => item.id !== movie?.id).slice(0, 10), [movie, movies]);

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

      {!loading && !error && !movie && (
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 md:px-8">
          <p className="text-base text-[#eef4ed]">Фільм не знайдено</p>
        </div>
      )}

      {!loading && !error && movie && (
        <>
          <HeroBanner
            movie={movie}
            eyebrow={`Released in ${movie.release_year}`}
            description={movie.description}
            actions={
              <>
                <Link
                  to="/library"
                  className="rounded-full bg-[#134074] px-6 py-3 text-sm font-semibold text-[#eef4ed] transition hover:bg-[#13315c]"
                >
                  Add to Library
                </Link>
                <Link
                  to="/explore"
                  className="rounded-full bg-[#eef4ed] px-6 py-3 text-sm font-semibold text-[#0b2545] transition hover:opacity-90"
                >
                  Back to Explore
                </Link>
              </>
            }
          />

          <div className="mx-auto mt-10 max-w-7xl space-y-10 px-4 md:px-8">
            <section className="grid gap-8 rounded-3xl bg-[#13315c] p-6 md:grid-cols-[240px_1fr] md:p-8">
              <img src={movie.image_url} alt={movie.title} className="w-full rounded-2xl object-cover shadow-xl" />
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.3em] text-[#8da9c4]">Movie Details</p>
                <h2 className="text-3xl font-bold text-[#eef4ed]">{movie.title}</h2>
                <p className="text-sm text-[#8da9c4]">Release year: {movie.release_year}</p>
                <p className="max-w-3xl text-sm leading-7 text-[#8da9c4]">{movie.description}</p>
              </div>
            </section>

            <RowSection title="More Like This" movies={relatedMovies} />
          </div>
        </>
      )}
    </section>
  );
}
