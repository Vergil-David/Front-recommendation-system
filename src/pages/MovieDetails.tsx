import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar, Compass, Plus } from "lucide-react";
import { getMovies, type Movie } from "@/api/movies";
import { HeroBanner } from "@/components/HeroBanner";
import { MoviePoster } from "@/components/MoviePoster";
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

  const movie = useMemo(
    () => movies.find((item) => String(item.id) === movieId),
    [movieId, movies],
  );
  const relatedMovies = useMemo(
    () => movies.filter((item) => item.id !== movie?.id).slice(0, 10),
    [movie, movies],
  );

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

      {!loading && !error && !movie && (
        <div className="mx-auto flex min-h-screen max-w-[1440px] items-center justify-center px-4 md:px-8">
          <p className="glass rounded-full px-5 py-3 text-base font-medium text-[#eef4ed]">
            Фільм не знайдено
          </p>
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
                  className="inline-flex items-center gap-2 rounded-lg bg-[#eef4ed] px-6 py-3 text-sm font-semibold text-[#0b2545] shadow-[0_18px_45px_rgba(0,0,0,0.25)] transition duration-300 hover:scale-105 hover:bg-[#eef4ed]/90"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add to Library
                </Link>
                <Link
                  to="/explore"
                  className="glass inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-[#eef4ed] transition duration-300 hover:scale-105 hover:bg-[#134074]/80"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back to Explore
                </Link>
              </>
            }
          />

          <div className="relative z-10 mx-auto -mt-10 max-w-[1440px] space-y-12 px-4 pt-4 md:px-8">
            <section className="glass grid gap-8 rounded-xl p-5 md:grid-cols-[240px_1fr] md:p-8 lg:grid-cols-[280px_1fr]">
              <MoviePoster
                imageUrl={movie.image_url}
                title={movie.title}
                className="aspect-[2/3] w-full rounded-lg object-cover soft-depth"
              />
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8da9c4]">
                    Movie Details
                  </p>
                  <h2 className="font-display text-3xl font-bold text-[#eef4ed] md:text-4xl">
                    {movie.title}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#0b2545]/55 px-4 py-2 text-sm font-semibold text-[#eef4ed]">
                    <Calendar className="h-4 w-4 text-[#8da9c4]" aria-hidden="true" />
                    {movie.release_year}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#0b2545]/55 px-4 py-2 text-sm font-semibold text-[#eef4ed]">
                    <Compass className="h-4 w-4 text-[#8da9c4]" aria-hidden="true" />
                    Curated match
                  </span>
                </div>
                <p className="max-w-3xl text-base leading-8 text-[#8da9c4]">{movie.description}</p>
              </div>
            </section>

            <RowSection title="More Like This" movies={relatedMovies} />
          </div>
        </>
      )}
    </section>
  );
}
