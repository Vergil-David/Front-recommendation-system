import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { searchItems, type SearchItem } from "@/api/search";
import { MoviePoster } from "@/components/MoviePoster";
import { BookCover } from "@/components/BookCover";
import { cn } from "@/utils/cn";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

type TypeFilter = "all" | "movie" | "book";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery]       = useState(initialQ);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [results, setResults]   = useState<SearchItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  const debouncedQuery = useDebounce(query.trim(), 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch when debounced query or type changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setSearched(false);
      return;
    }

    setSearchParams({ q: debouncedQuery }, { replace: true });
    setLoading(true);

    searchItems(debouncedQuery, typeFilter === "all" ? undefined : typeFilter, 40)
      .then((data) => {
        setResults(data.items);
        setSearched(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery, typeFilter, setSearchParams]);

  const movies = results.filter((r) => r.type === "movie");
  const books  = results.filter((r) => r.type === "book");

  return (
    <section className="min-h-screen px-4 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-[1440px] space-y-8">

        {/* Search input */}
        <div className="relative">
          <SearchIcon className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8da9c4]" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук фільмів і книг..."
            className="glass w-full rounded-2xl py-4 pl-14 pr-6 text-base font-medium text-[#eef4ed] placeholder-[#8da9c4]/60 outline-none ring-0 transition focus:ring-2 focus:ring-[#8da9c4]/40"
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-2">
          {(["all", "movie", "book"] as TypeFilter[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105",
                typeFilter === t
                  ? "bg-[#eef4ed] text-[#0b2545]"
                  : "glass text-[#8da9c4] hover:bg-[#134074]/80 hover:text-[#eef4ed]",
              )}
            >
              {t === "all" ? "Все" : t === "movie" ? "Фільми" : "Книги"}
            </button>
          ))}
        </div>

        {/* States */}
        {loading && (
          <p className="glass w-fit rounded-full px-5 py-3 text-sm font-medium text-[#eef4ed]">
            Пошук...
          </p>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="space-y-2 pt-4">
            <p className="text-lg font-semibold text-[#eef4ed]">Нічого не знайдено</p>
            <p className="text-sm text-[#8da9c4]">
              Спробуйте інше написання або скоротіть запит.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-10">
            {/* Movies section */}
            {movies.length > 0 && typeFilter !== "book" && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl font-semibold text-[#eef4ed]">Фільми</h2>
                  <span className="glass rounded-full px-3 py-1 text-xs font-semibold text-[#8da9c4]">
                    {movies.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
                  {movies.map((item) => (
                    <SearchCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Books section */}
            {books.length > 0 && typeFilter !== "movie" && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl font-semibold text-[#eef4ed]">Книги</h2>
                  <span className="glass rounded-full px-3 py-1 text-xs font-semibold text-[#a78bba]">
                    {books.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
                  {books.map((item) => (
                    <SearchCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state before typing */}
        {!loading && !searched && (
          <div className="flex flex-col items-center gap-4 pt-16 text-center">
            <SearchIcon className="h-16 w-16 text-[#8da9c4]/30" />
            <p className="text-base text-[#8da9c4]">
              Введіть назву, автора або жанр
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function SearchCard({ item }: { item: SearchItem }) {
  const href = item.type === "movie" ? `/movies/${item.id}` : `/books/${item.id}`;
  const isBook = item.type === "book";

  return (
    <Link
      to={href}
      className="group flex flex-col transition duration-500 hover:-translate-y-1"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.1rem] soft-depth transition duration-500 group-hover:shadow-[0_28px_70px_rgba(0,0,0,0.34)]",
          isBook ? "bg-[#1a0f2e]" : "bg-[#13315c]",
        )}
      >
        <div className="aspect-[2/3] overflow-hidden">
          {isBook ? (
            <BookCover
              imageUrl={item.image_url}
              title={item.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <MoviePoster
              imageUrl={item.image_url}
              title={item.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#081c35]/90 to-transparent" />
        <span
          className={cn(
            "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            isBook
              ? "bg-[#3d1f6d]/80 text-[#e8d5f5]"
              : "bg-[#13315c]/80 text-[#8da9c4]",
          )}
        >
          {isBook ? "книга" : "фільм"}
        </span>
      </div>
      <div className="mt-3 space-y-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#eef4ed] transition-colors group-hover:text-[#8da9c4]">
          {item.title}
        </h3>
        {item.release_year > 0 && (
          <p className="text-xs font-medium text-[#8da9c4]/80">{item.release_year}</p>
        )}
      </div>
    </Link>
  );
}
