import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Movie } from "@/api/movies";
import { MovieCard } from "@/components/MovieCard";
import { useMovieInteractionStates } from "@/features/interactions/useMovieInteractionStates";

type RowSectionProps = {
  title: string;
  movies: Movie[];
  emptyText?: string;
};

export function RowSection({ title, movies, emptyText = "No movies available." }: RowSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hiddenMovieIds, setHiddenMovieIds] = useState<number[]>([]);
  const { interactionStates, setInteractionState } = useMovieInteractionStates(
    movies.map((movie) => movie.id),
  );

  useEffect(() => {
    setHiddenMovieIds([]);
  }, [movies]);

  const visibleMovies = useMemo(
    () =>
      movies.filter(
        (movie) => !hiddenMovieIds.includes(movie.id) && !interactionStates[movie.id]?.skipped,
      ),
    [hiddenMovieIds, interactionStates, movies],
  );

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) {
      return;
    }

    const amount = scrollRef.current.offsetWidth * 0.72;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const hideMovie = (movieId: number) => {
    setHiddenMovieIds((current) => (current.includes(movieId) ? current : [...current, movieId]));
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-[#eef4ed] md:text-3xl">{title}</h2>
        {visibleMovies.length > 0 ? (
          <p className="text-sm font-medium text-[#8da9c4]">{visibleMovies.length} titles</p>
        ) : null}
      </div>

      {visibleMovies.length === 0 ? (
        <p className="text-sm text-[#8da9c4]">{emptyText}</p>
      ) : (
        <div className="group/row relative">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="glass absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[#eef4ed] opacity-0 transition duration-300 hover:bg-[#13315c]/90 group-hover/row:opacity-100 md:flex"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="glass absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[#eef4ed] opacity-0 transition duration-300 hover:bg-[#13315c]/90 group-hover/row:opacity-100 md:flex"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>

          <div
            ref={scrollRef}
            className="scrollbar-hide flex gap-4 overflow-x-auto px-1 py-2 md:gap-5 md:px-14"
          >
            {visibleMovies.map((movie, index) => (
              <MovieCard
                key={`${title}-${movie.id}`}
                movie={movie}
                className="w-[154px] shrink-0 md:w-[172px] lg:w-[188px]"
                priority={index < 5}
                interactionState={interactionStates[movie.id]}
                onInteractionStateChange={setInteractionState}
                onSkip={hideMovie}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
