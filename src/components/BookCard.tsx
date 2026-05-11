import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { MouseEvent } from "react";
import { Ban, BookOpen, Calendar, Heart, Star } from "lucide-react";
import type { Book } from "@/api/books";
import { createInteraction, type InteractionType, type MovieInteractionState } from "@/api/recommendations";
import {
  applyInteractionToState,
  createEmptyInteractionState,
} from "@/features/interactions/useMovieInteractionStates";
import { MovieActionButton } from "@/components/MovieActionButton";
import { BookCover } from "@/components/BookCover";
import { cn } from "@/utils/cn";

type BookCardProps = {
  book: Book;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  interactionState?: MovieInteractionState;
  onInteractionStateChange?: (bookId: number, nextState: MovieInteractionState) => void;
  onSkip?: (bookId: number) => void;
};

type QuickActionType = Extract<InteractionType, "liked" | "favorite" | "skipped">;

export function BookCard({
  book,
  className,
  imageClassName,
  priority = false,
  interactionState,
  onInteractionStateChange,
  onSkip,
}: BookCardProps) {
  const [pendingAction, setPendingAction] = useState<InteractionType | null>(null);
  const [localState, setLocalState] = useState<MovieInteractionState>(
    interactionState ?? createEmptyInteractionState(),
  );

  useEffect(() => {
    setLocalState(interactionState ?? createEmptyInteractionState());
  }, [interactionState]);

  const updateState = (nextState: MovieInteractionState) => {
    setLocalState(nextState);
    onInteractionStateChange?.(book.id, nextState);
  };

  const recordView = () => {
    if (localState.viewed || pendingAction === "viewed") {
      return;
    }

    const previousState = localState;
    const nextState = applyInteractionToState(previousState, "viewed");
    updateState(nextState);
    setPendingAction("viewed");

    void createInteraction(book.id, "viewed")
      .catch((error) => {
        console.error("Failed to record book view", error);
        updateState(previousState);
      })
      .finally(() => {
        setPendingAction((currentAction) => (currentAction === "viewed" ? null : currentAction));
      });
  };

  const recordAction = async (type: QuickActionType) => {
    if (pendingAction === type) {
      return;
    }

    const previousState = localState;
    const nextState = applyInteractionToState(previousState, type);

    try {
      setPendingAction(type);
      updateState(nextState);
      await createInteraction(book.id, type);

      if (type === "skipped") {
        onSkip?.(book.id);
      }
    } catch (error) {
      console.error(`Failed to record book ${type}`, error);
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
        <Link to={`/books/${book.id}`} className="block" onClick={recordView}>
          <div className="relative overflow-hidden rounded-[1.1rem] bg-[#1a0f2e] soft-depth transition duration-500 group-hover:shadow-[0_28px_70px_rgba(45,27,78,0.34)]">
            <div className={cn("aspect-[2/3] overflow-hidden", imageClassName)}>
              <BookCover
                imageUrl={book.image_url}
                title={book.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading={priority ? "eager" : "lazy"}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#120a1f] via-[#120a1f]/55 to-transparent" />
            {book.release_year > 0 ? (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[rgba(18,10,31,0.78)] px-2.5 py-1 text-[11px] font-semibold text-[#e8d5f5] backdrop-blur-xl">
                <Calendar className="h-3 w-3 text-[#a78bba]" aria-hidden="true" />
                {book.release_year}
              </span>
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a0f2e]/18 opacity-0 transition duration-300 group-hover:opacity-100">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8d5f5] text-[#1a0f2e] shadow-[0_14px_35px_rgba(0,0,0,0.28)]">
                <BookOpen className="h-4 w-4 fill-current" aria-hidden="true" />
              </span>
            </div>
          </div>
        </Link>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center">
          <div className="pointer-events-auto flex max-w-full flex-nowrap items-center gap-1.5 overflow-hidden rounded-full bg-[rgba(18,10,31,0.72)] p-1.5 shadow-[0_18px_45px_rgba(10,5,18,0.32)] backdrop-blur-2xl">
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

      <Link to={`/books/${book.id}`} className="mt-3 block min-w-0 flex-1" onClick={recordView}>
        <div className="min-w-0 space-y-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#eef4ed] transition-colors duration-300 group-hover:text-[#a78bba]">
            {book.title}
          </h3>
          {book.release_year > 0 ? (
            <p className="text-xs font-medium text-[#a78bba]/90">{book.release_year}</p>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
