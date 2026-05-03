import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { MouseEvent } from "react";
import { Ban, Calendar, Heart, Play, Star } from "lucide-react";
import type { Movie } from "@/api/movies";
import { createInteraction, type InteractionType, type MovieInteractionState } from "@/api/recommendations";
import {
  applyInteractionToState,
  createEmptyInteractionState,
} from "@/features/interactions/useMovieInteractionStates";
import { MovieActionButton } from "@/components/MovieActionButton";
import { MoviePoster } from "@/components/MoviePoster";
import { cn } from "@/utils/cn";

type MovieCardProps = {
  movie: Movie;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  interactionState?: MovieInteractionState;
  onInteractionStateChange?: (movieId: number, nextState: MovieInteractionState) => void;
  onSkip?: (movieId: number) => void;
};

type QuickActionType = Extract<InteractionType, "liked" | "favorite" | "skipped">;

export function MovieCard({
  movie,
  className,
  imageClassName,
  priority = false,
  interactionState,
  onInteractionStateChange,
  onSkip,
}: MovieCardProps) {
  const [pendingAction, setPendingAction] = useState<InteractionType | null>(null);
  const [localState, setLocalState] = useState<MovieInteractionState>(
    interactionState ?? createEmptyInteractionState(),
  );

  useEffect(() => {
    setLocalState(interactionState ?? createEmptyInteractionState());
  }, [interactionState]);

  const updateState = (nextState: MovieInteractionState) => {
    setLocalState(nextState);
    onInteractionStateChange?.(movie.id, nextState);
  };

  const recordView = () => {
    if (localState.viewed || pendingAction === "viewed") {
      return;
    }

    const previousState = localState;
    const nextState = applyInteractionToState(previousState, "viewed");
    updateState(nextState);
    setPendingAction("viewed");

    void createInteraction(movie.id, "viewed")
      .catch((error) => {
        console.error("Failed to record movie view", error);
        updateState(previousState);
      })
      .finally(() => {
        setPendingAction((currentAction) => (currentAction === "viewed" ? null : currentAction));
      });
  };

  const recordAction = async (type: QuickActionType) => {
    if (
      pendingAction === type ||
      (type === "liked" && localState.liked) ||
      (type === "favorite" && localState.favorite) ||
      (type === "skipped" && localState.skipped)
    ) {
      return;
    }

    const previousState = localState;
    const nextState = applyInteractionToState(previousState, type);

    try {
      setPendingAction(type);
      updateState(nextState);
      await createInteraction(movie.id, type);

      if (type === "skipped") {
        onSkip?.(movie.id);
      }
    } catch (error) {
      console.error(`Failed to record movie ${type}`, error);
      updateState(previousState);
    } finally {
      setPendingAction(null);
    }
  };

  const isLiked = localState.liked;
  const isFavorite = localState.favorite;
  const isSkipped = localState.skipped;
  const handleActionClick = (event: MouseEvent<HTMLButtonElement>, type: QuickActionType) => {
    event.preventDefault();
    event.stopPropagation();
    void recordAction(type);
  };

  return (
    <div
      className={cn(
        "group flex h-full min-w-0 flex-col transition duration-500 hover:-translate-y-1",
        isSkipped && "opacity-45 saturate-50",
        className,
      )}
    >
      <div className="relative">
        <Link to={`/movies/${movie.id}`} className="block" onClick={recordView}>
          <div className="relative overflow-hidden rounded-[1.1rem] bg-[#13315c] soft-depth transition duration-500 group-hover:shadow-[0_28px_70px_rgba(19,64,116,0.34)]">
            <div className={cn("aspect-[2/3] overflow-hidden", imageClassName)}>
              <MoviePoster
                imageUrl={movie.image_url}
                title={movie.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading={priority ? "eager" : "lazy"}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#081c35] via-[#081c35]/55 to-transparent" />
            {movie.release_year > 0 ? (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[rgba(8,28,53,0.78)] px-2.5 py-1 text-[11px] font-semibold text-[#eef4ed] backdrop-blur-xl">
                <Calendar className="h-3 w-3 text-[#8da9c4]" aria-hidden="true" />
                {movie.release_year}
              </span>
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center bg-[#0b2545]/18 opacity-0 transition duration-300 group-hover:opacity-100">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ed] text-[#0b2545] shadow-[0_14px_35px_rgba(0,0,0,0.28)]">
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              </span>
            </div>
          </div>
        </Link>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center">
          <div className="pointer-events-auto flex max-w-full flex-nowrap items-center gap-1.5 overflow-hidden rounded-full bg-[rgba(8,28,53,0.72)] p-1.5 shadow-[0_18px_45px_rgba(2,10,20,0.32)] backdrop-blur-2xl">
            <MovieActionButton
              compact
              label="Like"
              activeLabel="Liked"
              icon={Heart}
              active={isLiked}
              pending={pendingAction === "liked"}
              disabled={pendingAction !== null}
              onClick={(event) => handleActionClick(event, "liked")}
            />
            <MovieActionButton
              compact
              label="Favorite"
              activeLabel="Saved"
              icon={Star}
              active={isFavorite}
              pending={pendingAction === "favorite"}
              disabled={pendingAction !== null}
              onClick={(event) => handleActionClick(event, "favorite")}
            />
            <MovieActionButton
              compact
              label="Not interested"
              activeLabel="Hidden"
              icon={Ban}
              active={isSkipped}
              pending={pendingAction === "skipped"}
              disabled={pendingAction !== null}
              onClick={(event) => handleActionClick(event, "skipped")}
            />
          </div>
        </div>
      </div>

      <Link to={`/movies/${movie.id}`} className="mt-3 block min-w-0 flex-1" onClick={recordView}>
        <div className="min-w-0 space-y-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#eef4ed] transition-colors duration-300 group-hover:text-[#8da9c4]">
            {movie.title}
          </h3>
          {movie.release_year > 0 ? (
            <p className="text-xs font-medium text-[#8da9c4]/90">{movie.release_year}</p>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
