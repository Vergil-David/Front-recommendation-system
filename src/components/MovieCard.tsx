import { Link } from "react-router-dom";
import type { Movie } from "@/api/movies";
import { cn } from "@/utils/cn";

type MovieCardProps = {
  movie: Movie;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function MovieCard({ movie, className, imageClassName, priority = false }: MovieCardProps) {
  return (
    <Link
      to={`/movies/${movie.id}`}
      className={cn(
        "group block overflow-hidden rounded-xl bg-[#13315c] transition duration-300 hover:scale-105 hover:bg-[#134074]",
        className,
      )}
    >
      <img
        src={movie.image_url}
        alt={movie.title}
        className={cn("h-60 w-full object-cover transition duration-300 group-hover:scale-[1.03]", imageClassName)}
        loading={priority ? "eager" : "lazy"}
      />
      <div className="space-y-1 px-3 py-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-[#eef4ed]">{movie.title}</h3>
        <p className="text-xs text-[#8da9c4]">{movie.release_year}</p>
      </div>
    </Link>
  );
}
