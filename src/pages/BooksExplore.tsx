import { useEffect, useMemo, useState } from "react";
import { getBooks, type Book } from "@/api/books";
import { BookGenreFilter, getBookGenres } from "@/components/BookGenreFilter";
import { BookCard } from "@/components/BookCard";
import { useMovieInteractionStates } from "@/features/interactions/useMovieInteractionStates";

const PAGE_LIMIT = 50;

export function BooksExplore() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { interactionStates, setInteractionState } = useMovieInteractionStates(
    books.map((book) => book.id),
  );

  useEffect(() => {
    let isMounted = true;

    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBooks(1, PAGE_LIMIT);

        if (isMounted) {
          setBooks(data.items);
          setPage(data.page);
          setHasMore(data.page * data.limit < data.total);
        }
      } catch {
        if (isMounted) {
          setError("Не вдалося завантажити книги");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBooks = useMemo(() => {
    if (selectedGenre === "All") {
      return books;
    }

    return books.filter((book) => getBookGenres(book).includes(selectedGenre));
  }, [books, selectedGenre]);

  const loadMoreBooks = async () => {
    if (!hasMore || loadingMore) {
      return;
    }

    const nextPage = page + 1;

    try {
      setLoadingMore(true);
      const data = await getBooks(nextPage, PAGE_LIMIT);

      setBooks((current) => {
        const knownIds = new Set(current.map((book) => book.id));
        const nextBooks = data.items.filter((book) => !knownIds.has(book.id));
        return [...current, ...nextBooks];
      });
      setPage(data.page);
      setHasMore(data.page * data.limit < data.total);
    } catch (loadError) {
      console.error("Failed to load more books", loadError);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section className="min-h-screen px-4 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-[1440px] space-y-9">
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
            {filteredBooks.length} titles
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a78bba]">
            Filters
          </p>
          <BookGenreFilter selected={selectedGenre} onSelect={setSelectedGenre} />
        </div>

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
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  className="h-full"
                  interactionState={interactionStates[book.id]}
                  onInteractionStateChange={setInteractionState}
                />
              ))}
            </div>

            {hasMore ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadMoreBooks()}
                  disabled={loadingMore}
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#3d1f6d,#2d1b4e)] px-6 py-3 text-sm font-semibold text-[#e8d5f5] shadow-[0_18px_45px_rgba(26,15,46,0.28)] transition duration-300 hover:scale-105 hover:shadow-[0_24px_55px_rgba(45,27,78,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingMore ? "Завантаження..." : "Load more"}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
