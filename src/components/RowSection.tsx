import type { Movie } from "@/api/movies";
import { MovieCard } from "@/components/MovieCard";

type RowSectionProps = {
  title: string;
  movies: Movie[];
  emptyText?: string;
};

export function RowSection({ title, movies, emptyText = "No movies available." }: RowSectionProps) {
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-semibold text-[#eef4ed]">{title}</h2>
      {movies.length === 0 ? (
        <p className="text-sm text-[#8da9c4]">{emptyText}</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {movies.map((movie, index) => (
            <MovieCard key={`${title}-${movie.id}`} movie={movie} className="w-[200px] shrink-0" priority={index < 5} />
          ))}
        </div>
      )}
    </section>
  );
}
