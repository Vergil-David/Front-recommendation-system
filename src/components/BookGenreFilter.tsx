import type { Book } from "@/api/books";
import { cn } from "@/utils/cn";

export const BOOK_GENRE_OPTIONS = [
  "All",
  "Художня",
  "Нехудожня",
  "Фентезі",
  "Детектив",
  "Мелодрама",
  "Фантастика",
  "Біографія",
  "Історія",
  "Жахи",
  "Саморозвиток",
];

const BOOK_GENRE_KEYWORDS: Record<string, string[]> = {
  Художня: ["fiction", "novel", "story", "tales"],
  Нехудожня: ["non-fiction", "nonfiction", "essay", "documentary", "journalism"],
  Фентезі: ["fantasy", "magic", "dragon", "wizard", "kingdom", "sword"],
  Детектив: ["mystery", "detective", "crime", "murder", "investigation", "thriller"],
  Мелодрама: ["romance", "love", "heart", "passion", "relationship"],
  Фантастика: ["science fiction", "space", "future", "robot", "planet", "alien", "dystopia"],
  Біографія: ["biography", "memoir", "autobiography", "life story"],
  Історія: ["history", "historical", "war", "ancient", "century", "empire"],
  Жахи: ["horror", "ghost", "dark", "terror", "haunted", "supernatural"],
  Саморозвиток: ["self-help", "self help", "motivation", "habit", "productivity", "mindset"],
};

export function getBookGenres(book: Book) {
  // Use actual genre data from the API when available
  if (book.genres && book.genres.length > 0) {
    const matched = Object.keys(BOOK_GENRE_KEYWORDS).filter((genre) =>
      book.genres!.some((g) => g.toLowerCase().includes(genre.toLowerCase())),
    );
    if (matched.length > 0) return matched;
  }

  // Fallback: keyword matching on title + description
  const haystack = `${book.title} ${book.description}`.toLowerCase();
  const genres = Object.entries(BOOK_GENRE_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => haystack.includes(keyword)))
    .map(([genre]) => genre);

  return genres.length > 0 ? genres : ["Fiction"];
}

type BookGenreFilterProps = {
  selected: string;
  onSelect: (value: string) => void;
};

export function BookGenreFilter({ selected, onSelect }: BookGenreFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {BOOK_GENRE_OPTIONS.map((genre) => {
        const active = selected === genre;

        return (
          <button
            key={genre}
            type="button"
            onClick={() => onSelect(genre)}
            className={cn(
              "rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-300 hover:scale-105",
              active
                ? "bg-[#e8d5f5] text-[#1a0f2e]"
                : "glass text-[#a78bba] hover:bg-[#2d1b4e]/80 hover:text-[#e8d5f5]",
            )}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}
