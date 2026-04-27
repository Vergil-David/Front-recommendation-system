import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Movie } from "@/api/movies";
import { MovieCard } from "@/components/MovieCard";

type RowSectionProps = {
  title: string;
  movies: Movie[];
  emptyText?: string;
};

export function RowSection({ title, movies, emptyText = "No movies available." }: RowSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-[#eef4ed] md:text-3xl">{title}</h2>
        {movies.length > 0 ? (
          <p className="text-sm font-medium text-[#8da9c4]">{movies.length} titles</p>
        ) : null}
      </div>

      {movies.length === 0 ? (
        <p className="text-sm text-[#8da9c4]">{emptyText}</p>
      ) : (
        <div className="group/row relative -mx-4 md:-mx-8">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="glass absolute bottom-10 left-0 top-0 z-10 hidden w-12 items-center justify-center text-[#eef4ed] opacity-0 transition duration-300 hover:bg-[#13315c]/90 group-hover/row:opacity-100 md:flex"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="glass absolute bottom-10 right-0 top-0 z-10 hidden w-12 items-center justify-center text-[#eef4ed] opacity-0 transition duration-300 hover:bg-[#13315c]/90 group-hover/row:opacity-100 md:flex"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>

          <div
            ref={scrollRef}
            className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-4 md:gap-5 md:px-8"
          >
            {movies.map((movie, index) => (
              <MovieCard
                key={`${title}-${movie.id}`}
                movie={movie}
                className="w-[160px] shrink-0 md:w-[180px] lg:w-[200px]"
                priority={index < 5}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
