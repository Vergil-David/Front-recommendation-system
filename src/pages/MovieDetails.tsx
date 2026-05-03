import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Ban, Calendar, Check, Compass, Heart, Plus, Star, ThumbsDown } from "lucide-react";
import { getMovieById, getMovies, type Movie } from "@/api/movies";
import { createInteraction, getRecommendations, type InteractionType } from "@/api/recommendations";
import {
  applyInteractionToState,
  createEmptyInteractionState,
  useMovieInteractionStates,
} from "@/features/interactions/useMovieInteractionStates";
import { MovieActionButton } from "@/components/MovieActionButton";
import { HeroBanner } from "@/components/HeroBanner";
import { MoviePoster } from "@/components/MoviePoster";
import { RowSection } from "@/components/RowSection";
import { cn } from "@/utils/cn";

type DetailActionType = Extract<
  InteractionType,
  "viewed" | "liked" | "disliked" | "favorite" | "skipped"
>;

export function MovieDetails() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pendingAction, setPendingAction] = useState<InteractionType | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMovieDetails = async () => {
      if (!movieId) {
        if (isMounted) {
          setMovie(null);
          setRelatedMovies([]);
          setNotFound(false);
          setError("Не вдалося завантажити фільм");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const [movieResult, moviesResult, recommendationsResult] = await Promise.allSettled([
          getMovieById(movieId),
          getMovies(1, 50),
          getRecommendations(50),
        ]);

        if (movieResult.status === "rejected") {
          throw movieResult.reason;
        }

        const currentMovie = movieResult.value;
        const movieItems = moviesResult.status === "fulfilled" ? moviesResult.value.items : [];
        const recommendedItems =
          recommendationsResult.status === "fulfilled" ? recommendationsResult.value.items : [];
        const relatedMap = new Map<number, Movie>();

        for (const item of [...movieItems, ...recommendedItems]) {
          if (String(item.id) === String(currentMovie.id) || relatedMap.has(item.id)) {
            continue;
          }

          relatedMap.set(item.id, item);
        }

        if (isMounted) {
          setMovie(currentMovie);
          setRelatedMovies(Array.from(relatedMap.values()).slice(0, 10));
        }
      } catch (loadError) {
        if (isMounted) {
          setMovie(null);
          setRelatedMovies([]);

          if (axios.isAxiosError(loadError) && loadError.response?.status === 404) {
            setNotFound(true);
            setError(null);
          } else {
            setError("Не вдалося завантажити фільм");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadMovieDetails();

    return () => {
      isMounted = false;
    };
  }, [movieId]);

  const { interactionStates, setInteractionState } = useMovieInteractionStates(
    movie ? [movie.id] : [],
  );
  const interactionState = movie
    ? interactionStates[movie.id] ?? createEmptyInteractionState()
    : createEmptyInteractionState();

  useEffect(() => {
    if (!movie || interactionState.viewed) {
      return;
    }

    const nextState = applyInteractionToState(interactionState, "viewed");
    setInteractionState(movie.id, nextState);

    void createInteraction(movie.id, "viewed").catch((error) => {
      console.error("Failed to record movie view", error);
      setInteractionState(movie.id, interactionState);
    });
  }, [interactionState, movie, setInteractionState]);

  const handleInteraction = async (type: DetailActionType) => {
    if (!movie || pendingAction === type) {
      return;
    }

    const isAlreadyActive =
      (type === "viewed" && interactionState.viewed) ||
      (type === "liked" && interactionState.liked) ||
      (type === "disliked" && interactionState.disliked) ||
      (type === "favorite" && interactionState.favorite) ||
      (type === "skipped" && interactionState.skipped);

    if (isAlreadyActive) {
      return;
    }

    const previousState = interactionState;
    const nextState = applyInteractionToState(previousState, type);

    try {
      setPendingAction(type);
      setInteractionState(movie.id, nextState);
      await createInteraction(movie.id, type);
    } catch (error) {
      console.error(`Failed to record detail interaction ${type}`, error);
      setInteractionState(movie.id, previousState);
    } finally {
      setPendingAction(null);
    }
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

      {!loading && !error && notFound && (
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
                  to="/explore"
                  className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-[#eef4ed] transition duration-300 hover:-translate-y-0.5 hover:bg-[#134074]/80"
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
                className={cn(
                  "aspect-[2/3] w-full rounded-lg object-cover soft-depth transition duration-300",
                  interactionState.skipped && "opacity-45 saturate-50",
                )}
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
                <div className="flex flex-wrap gap-3">
                  <MovieActionButton
                    label="Watched"
                    icon={Check}
                    active={interactionState.viewed}
                    pending={pendingAction === "viewed"}
                    disabled={pendingAction !== null}
                    onClick={() => void handleInteraction("viewed")}
                  />
                  <MovieActionButton
                    label="Like"
                    activeLabel="Liked"
                    icon={Heart}
                    active={interactionState.liked}
                    pending={pendingAction === "liked"}
                    disabled={pendingAction !== null}
                    onClick={() => void handleInteraction("liked")}
                  />
                  <MovieActionButton
                    label="Dislike"
                    activeLabel="Disliked"
                    icon={ThumbsDown}
                    active={interactionState.disliked}
                    pending={pendingAction === "disliked"}
                    disabled={pendingAction !== null}
                    onClick={() => void handleInteraction("disliked")}
                  />
                  <MovieActionButton
                    label="Favorite"
                    activeLabel="Saved"
                    icon={Star}
                    active={interactionState.favorite}
                    pending={pendingAction === "favorite"}
                    disabled={pendingAction !== null}
                    onClick={() => void handleInteraction("favorite")}
                  />
                  <MovieActionButton
                    label="Not interested"
                    activeLabel="Hidden"
                    icon={Ban}
                    active={interactionState.skipped}
                    pending={pendingAction === "skipped"}
                    disabled={pendingAction !== null}
                    onClick={() => void handleInteraction("skipped")}
                  />
                  <Link
                    to="/library"
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[rgba(11,37,69,0.7)] px-4 py-2.5 text-sm font-semibold text-[#eef4ed] shadow-[0_18px_45px_rgba(4,15,27,0.24)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-[rgba(19,64,116,0.88)]"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add to Library
                  </Link>
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
