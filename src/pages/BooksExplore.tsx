import { useEffect, useRef, useState } from "react";
import { getBooks, getBookGenres, type Book } from "@/api/books";
import { BookCard } from "@/components/BookCard";
import { useMovieInteractionStates } from "@/features/interactions/useMovieInteractionStates";
import { cn } from "@/utils/cn";

const PAGE_LIMIT = 48;

export function BooksExplore() {
  const [allBooks, setAllBooks]       = useState<Book[]>([]);
  const [genres, setGenres]           = useState<string[]>([]);
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState("All");

  const seenIds = useRef<Set<number>>(new Set());

  const { interactionStates, setInteractionState } = useMovieInteractionStates(
    allBooks.map((b) => b.id),
  );

  // Load genres once on mount
  useEffect(() => {
    getBookGenres().then(setGenres).catch(() => {});
  }, []);

  // Reload books when genre changes
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setAllBooks([]);
    setPage(1);
    setTotal(0);
    seenIds.current = new Set();

    const activeGenre = selectedGenre === "All" ? undefined : selectedGenre;

    getBooks(1, PAGE_LIMIT, "random", activeGenre)
      .then((data) => {
        if (!mounted) return;
        for (const b of data.items) seenIds.current.add(b.id);
        setAllBooks(data.items);
        setTotal(data.total);
        setPage(data.page);
      })
      .catch(() => { if (mounted) setError("Не вдалося завантажити книги"); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [selectedGenre]);

  const loadMore = async () => {
    if (loadingMore || allBooks.length >= total) return;
    setLoadingMore(true);
    const activeGenre = selectedGenre === "All" ? undefined : selectedGenre;
    try {
      const data = await getBooks(page + 1, PAGE_LIMIT, "random", activeGenre);
      const fresh = data.items.filter((b) => !seenIds.current.has(b.id));
      for (const b of fresh) seenIds.current.add(b.id);
      setAllBooks((prev) => [...prev, ...fresh]);
      setPage(data.page);
      setTotal(data.total);
    } catch {
      // non-fatal
    } finally {
      setLoadingMore(false);
    }
  };

  // No client-side filtering needed — backend already filters by genre
  const filteredBooks = allBooks;

  const hasMore = allBooks.length < total;

  return (
    <section className="min-h-screen px-4 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-[1440px] space-y-9">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#a78bba]">
              Books
            </p>
            <h1 className="font-display text-4xl font-bold text-[#eef4ed] md:text-5xl">
              Find your next read
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[#a78bba]">
              Browse a curated catalog shaped around your reading tastes.
            </p>
          </div>
          <div className="glass w-fit rounded-full px-4 py-2 text-sm font-semibold text-[#eef4ed]">
            {filteredBooks.length}{hasMore && selectedGenre === "All" ? ` / ${total}` : ""} titles
          </div>
        </div>

        {/* Genre filter */}
        {genres.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a78bba]">
              Filters
            </p>
            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedGenre("All")}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-300 hover:scale-105",
                  selectedGenre === "All"
                    ? "bg-[#e8d5f5] text-[#1a0f2e]"
                    : "glass text-[#a78bba] hover:bg-[#2d1b4e]/80 hover:text-[#e8d5f5]",
                )}
              >
                All
              </button>
              {genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-300 hover:scale-105",
                    selectedGenre === genre
                      ? "bg-[#e8d5f5] text-[#1a0f2e]"
                      : "glass text-[#a78bba] hover:bg-[#2d1b4e]/80 hover:text-[#e8d5f5]",
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <p className="glass w-fit rounded-full px-5 py-3 text-base font-medium text-[#eef4ed]">
            Завантаження...
          </p>
        )}
        {error && (
          <p className="glass w-fit rounded-full px-5 py-3 text-base font-medium text-[#eef4ed]">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
              {filteredBooks.map((book, index) => (
                <BookCard
                  key={book.id}
                  book={book}
                  className="h-full"
                  priority={index < 12}
                  interactionState={interactionStates[book.id]}
                  onInteractionStateChange={setInteractionState}
                />
              ))}
            </div>

            {hasMore && selectedGenre === "All" && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d1f6d,#2d1b4e)] px-6 py-3 text-sm font-semibold text-[#e8d5f5] shadow-[0_18px_45px_rgba(26,15,46,0.28)] transition duration-300 hover:scale-105 hover:shadow-[0_24px_55px_rgba(45,27,78,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingMore ? "Завантаження..." : "Load more"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
