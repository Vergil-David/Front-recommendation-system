import type { Movie } from "@/api/movies";
import { cn } from "@/utils/cn";

export const GENRE_OPTIONS = ["All", "Drama", "Action", "Comedy", "Thriller", "Sci-Fi"];

const GENRE_KEYWORDS: Record<string, string[]> = {
  Drama: ["drama", "life", "family", "love", "story"],
  Action: ["action", "war", "fight", "mission", "battle"],
  Comedy: ["comedy", "fun", "laugh", "school", "party"],
  Thriller: ["thriller", "crime", "mystery", "dark", "killer"],
  "Sci-Fi": ["space", "future", "science", "robot", "planet"],
};

export function getMovieGenres(movie: Movie) {
  const haystack = `${movie.title} ${movie.description}`.toLowerCase();
  const genres = Object.entries(GENRE_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => haystack.includes(keyword)))
    .map(([genre]) => genre);

  return genres.length > 0 ? genres : ["Drama"];
}

type GenreFilterProps = {
  selected: string;
  onSelect: (value: string) => void;
};

export function GenreFilter({ selected, onSelect }: GenreFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {GENRE_OPTIONS.map((genre) => {
        const active = selected === genre;

        return (
          <button
            key={genre}
            type="button"
            onClick={() => onSelect(genre)}
            className={cn(
              "rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-300 hover:scale-105",
              active
                ? "bg-[#eef4ed] text-[#0b2545]"
                : "glass text-[#8da9c4] hover:bg-[#134074]/80 hover:text-[#eef4ed]",
            )}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}
