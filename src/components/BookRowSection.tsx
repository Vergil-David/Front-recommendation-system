import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Book } from "@/api/books";
import { BookCard } from "@/components/BookCard";
import { useMovieInteractionStates } from "@/features/interactions/useMovieInteractionStates";
import type { MovieInteractionState } from "@/api/recommendations";

type BookRowSectionProps = {
  title: string;
  books: Book[];
  emptyText?: string;
};

export function BookRowSection({ title, books, emptyText = "Книг немає." }: BookRowSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hiddenBookIds, setHiddenBookIds] = useState<number[]>([]);
  const { interactionStates, setInteractionState } = useMovieInteractionStates(
    books.map((book) => book.id),
  );

  useEffect(() => {
    setHiddenBookIds([]);
  }, [books]);

  const visibleBooks = useMemo(
    () =>
      books.filter(
        (book) => !hiddenBookIds.includes(book.id) && !interactionStates[book.id]?.skipped,
      ),
    [hiddenBookIds, interactionStates, books],
  );

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

  const hideBook = (bookId: number) => {
    setHiddenBookIds((current) => (current.includes(bookId) ? current : [...current, bookId]));
  };

  const handleInteractionChange = (bookId: number, nextState: MovieInteractionState) => {
    setInteractionState(bookId, nextState);
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-[#eef4ed] md:text-3xl">{title}</h2>
        {visibleBooks.length > 0 ? (
          <p className="text-sm font-medium text-[#a78bba]">{visibleBooks.length} назв</p>
        ) : null}
      </div>

      {visibleBooks.length === 0 ? (
        <p className="text-sm text-[#a78bba]">{emptyText}</p>
      ) : (
        <div className="group/row relative">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="glass absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[#eef4ed] opacity-0 transition duration-300 hover:bg-[#2d1b4e]/90 group-hover/row:opacity-100 md:flex"
            aria-label={`Прокрутити ${title} вліво`}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="glass absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[#eef4ed] opacity-0 transition duration-300 hover:bg-[#2d1b4e]/90 group-hover/row:opacity-100 md:flex"
            aria-label={`Прокрутити ${title} вправо`}
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>

          <div
            ref={scrollRef}
            className="scrollbar-hide flex gap-4 overflow-x-auto px-1 py-2 md:gap-5 md:px-14"
          >
            {visibleBooks.map((book, index) => (
              <BookCard
                key={`${title}-${book.id}`}
                book={book}
                className="w-[154px] shrink-0 md:w-[172px] lg:w-[188px]"
                priority={index < 5}
                interactionState={interactionStates[book.id]}
                onInteractionStateChange={handleInteractionChange}
                onSkip={hideBook}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
