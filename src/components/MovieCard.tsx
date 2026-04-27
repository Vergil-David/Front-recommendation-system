import { Link } from "react-router-dom";
import { Calendar, Play } from "lucide-react";
import type { Movie } from "@/api/movies";
import { MoviePoster } from "@/components/MoviePoster";
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
      className={cn("group block min-w-0 transition duration-500 hover:-translate-y-1", className)}
    >
      <div className="relative mb-3 overflow-hidden rounded-lg bg-[#13315c] soft-depth transition duration-500 group-hover:shadow-[0_28px_70px_rgba(19,64,116,0.34)]">
        <div className={cn("aspect-[2/3] overflow-hidden", imageClassName)}>
          <MoviePoster
            imageUrl={movie.image_url}
            title={movie.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            loading={priority ? "eager" : "lazy"}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b2545]/95 via-[#0b2545]/45 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0b2545]/70 p-4 opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ed] text-[#0b2545] shadow-[0_14px_35px_rgba(0,0,0,0.28)]">
            <Play className="h-5 w-5 fill-current" aria-hidden="true" />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#13315c]/85 px-3 py-1 text-xs font-semibold text-[#eef4ed]">
            <Calendar className="h-3.5 w-3.5 text-[#8da9c4]" aria-hidden="true" />
            {movie.release_year}
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-[#eef4ed] transition-colors duration-300 group-hover:text-[#8da9c4]">
          {movie.title}
        </h3>
        <p className="mt-1 text-xs text-[#8da9c4]">{movie.release_year}</p>
      </div>
    </Link>
  );
}
