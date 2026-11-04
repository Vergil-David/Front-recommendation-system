import type { Movie } from "@/api/movies";
import { cn } from "@/utils/cn";

export const GENRE_OPTIONS = ["All", "Драма", "Бойовик", "Комедія", "Трилер", "Фантастика"];

const GENRE_KEYWORDS: Record<string, string[]> = {
  Драма: ["drama", "life", "family", "love", "story"],
  Бойовик: ["action", "war", "fight", "mission", "battle"],
  Комедія: ["comedy", "fun", "laugh", "school", "party"],
  Трилер: ["thriller", "crime", "mystery", "dark", "killer"],
  Фантастика: ["space", "future", "science", "robot", "planet"],
};

export function getMovieGenres(movie: Movie) {
  // Use actual genre data from the API when available
  if (movie.genres && movie.genres.length > 0) {
    const matched = Object.keys(GENRE_KEYWORDS).filter((genre) =>
      movie.genres!.some((g) => g.toLowerCase().includes(genre.toLowerCase())),
    );
    if (matched.length > 0) return matched;
  }

  // Fallback: keyword matching on title + description
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
