import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Ban, BookMarked, Calendar, Heart, Star, ThumbsDown } from "lucide-react";
import { getBookById, getBooks, type Book } from "@/api/books";
import { createInteraction, type InteractionType } from "@/api/recommendations";
import {
  applyInteractionToState,
  createEmptyInteractionState,
  useMovieInteractionStates,
} from "@/features/interactions/useMovieInteractionStates";
import { MovieActionButton } from "@/components/MovieActionButton";
import { BookCover } from "@/components/BookCover";
import { BookRowSection } from "@/components/BookRowSection";
import { cn } from "@/utils/cn";

type DetailActionType = Extract<
  InteractionType,
  "viewed" | "liked" | "disliked" | "favorite" | "skipped"
>;

export function BookDetails() {
  const { bookId } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pendingAction, setPendingAction] = useState<InteractionType | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadBookDetails = async () => {
      if (!bookId) {
        if (isMounted) {
          setBook(null);
          setRelatedBooks([]);
          setNotFound(false);
          setError("Не вдалося завантажити книгу");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const [bookResult, booksResult] = await Promise.allSettled([
          getBookById(bookId),
          getBooks(1, 50),
        ]);

        if (bookResult.status === "rejected") {
          throw bookResult.reason;
        }

        const currentBook = bookResult.value;
        const bookItems = booksResult.status === "fulfilled" ? booksResult.value.items : [];
        const relatedMap = new Map<number, Book>();

        for (const item of bookItems) {
          if (String(item.id) === String(currentBook.id) || relatedMap.has(item.id)) {
            continue;
          }

          relatedMap.set(item.id, item);
        }

        if (isMounted) {
          setBook(currentBook);
          setRelatedBooks(Array.from(relatedMap.values()).slice(0, 10));
        }
      } catch (loadError) {
        if (isMounted) {
          setBook(null);
          setRelatedBooks([]);

          if (axios.isAxiosError(loadError) && loadError.response?.status === 404) {
            setNotFound(true);
            setError(null);
          } else {
            setError("Не вдалося завантажити книгу");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadBookDetails();

    return () => {
      isMounted = false;
    };
  }, [bookId]);

  const { interactionStates, setInteractionState } = useMovieInteractionStates(
    book ? [book.id] : [],
  );
  const interactionState = book
    ? interactionStates[book.id] ?? createEmptyInteractionState()
    : createEmptyInteractionState();

  useEffect(() => {
    if (!book || interactionState.viewed) {
      return;
    }

    const nextState = applyInteractionToState(interactionState, "viewed");
    setInteractionState(book.id, nextState);

    void createInteraction(book.id, "viewed").catch((error) => {
      console.error("Failed to record book view", error);
      setInteractionState(book.id, interactionState);
    });
  }, [interactionState, book, setInteractionState]);

  const handleInteraction = async (type: DetailActionType) => {
    if (!book || pendingAction === type) {
      return;
    }

    const previousState = interactionState;
    const nextState = applyInteractionToState(previousState, type);

    try {
      setPendingAction(type);
      setInteractionState(book.id, nextState);
      await createInteraction(book.id, type);
    } catch (error) {
      console.error(`Failed to record detail interaction ${type}`, error);
      setInteractionState(book.id, previousState);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <section className="min-h-screen pb-20">
      {loading && (
        <div className="flex min-h-screen items-center justify-center px-4 md:px-8">
          <p className="glass rounded-full px-5 py-3 text-base font-medium text-[#eef4ed]">
            Завантаження...
          </p>
        </div>
      )}

      {error && (
        <div className="flex min-h-screen items-center justify-center px-4 md:px-8">
          <p className="glass rounded-full px-5 py-3 text-base font-medium text-[#eef4ed]">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && notFound && (
        <div className="mx-auto flex min-h-screen max-w-[1440px] items-center justify-center px-4 md:px-8">
          <p className="glass rounded-full px-5 py-3 text-base font-medium text-[#eef4ed]">
            Книгу не знайдено
          </p>
        </div>
      )}

      {!loading && !error && book && (
        <>
          {/* Hero Banner for Book */}
          <section className="relative h-[82vh] min-h-[620px] w-full overflow-hidden">
            <div className="absolute inset-0">
              <BookCover
                imageUrl={book.image_url}
                title={book.title}
                className="h-full w-full scale-110 object-cover object-center opacity-80 blur-sm"
                loading="eager"
              />
            </div>
            <div className="absolute inset-0 gradient-hero" />
            <div className="absolute inset-0 gradient-hero-side" />
            <div className="absolute inset-x-0 bottom-0 h-36 gradient-fade-bottom" />

            <div className="relative z-10 h-full">
              <div className="mx-auto flex h-full max-w-[1440px] items-end px-4 pb-16 pt-24 md:px-8 md:pb-24">
                <div className="flex w-full items-end gap-8 md:gap-12">
                  <BookCover
                    imageUrl={book.image_url}
                    title={book.title}
                    className="hidden aspect-[2/3] w-44 shrink-0 rounded-lg object-cover soft-depth md:block lg:w-52"
                    loading="eager"
                  />

                  <div className="max-w-3xl pb-1">
                    <p className="animate-fade-in text-sm font-semibold uppercase tracking-[0.24em] text-[#a78bba]">
                      {`Видано у ${book.release_year}`}
                    </p>
                    <h1 className="font-display mt-4 max-w-4xl animate-fade-in-up text-5xl font-bold leading-tight text-[#eef4ed] md:text-6xl lg:text-7xl">
                      {book.title}
                    </h1>
                    <p className="mt-5 max-w-2xl animate-fade-in line-clamp-3 text-base leading-7 text-[#a78bba]">
                      {book.description}
                    </p>

                    <div className="mt-8 flex animate-fade-in flex-wrap items-center gap-3">
                      <Link
                        to="/books"
                        className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-[#eef4ed] transition duration-300 hover:-translate-y-0.5 hover:bg-[#2d1b4e]/80"
                      >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Назад до книг
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="relative z-10 mx-auto -mt-10 max-w-[1440px] space-y-12 px-4 pt-4 md:px-8">
            <section className="glass grid gap-8 rounded-xl p-5 md:grid-cols-[240px_1fr] md:p-8 lg:grid-cols-[280px_1fr]">
              <BookCover
                imageUrl={book.image_url}
                title={book.title}
                className={cn(
                  "aspect-[2/3] w-full rounded-lg object-cover soft-depth transition duration-300",
                  interactionState.skipped && "opacity-45 saturate-50",
                )}
              />
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#a78bba]">
                    Про книгу
                  </p>
                  <h2 className="font-display text-3xl font-bold text-[#eef4ed] md:text-4xl">
                    {book.title}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#1a0f2e]/55 px-4 py-2 text-sm font-semibold text-[#eef4ed]">
                    <Calendar className="h-4 w-4 text-[#a78bba]" aria-hidden="true" />
                    {book.release_year}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#1a0f2e]/55 px-4 py-2 text-sm font-semibold text-[#eef4ed]">
                    <BookMarked className="h-4 w-4 text-[#a78bba]" aria-hidden="true" />
                    Підібрано для вас
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <MovieActionButton
                    label="Подобається"
                    activeLabel="Вподобано"
                    icon={Heart}
                    active={interactionState.liked}
                    pending={pendingAction === "liked"}
                    disabled={pendingAction !== null}
                    onClick={() => void handleInteraction("liked")}
                  />
                  <MovieActionButton
                    label="Не подобається"
                    activeLabel="Не сподобалось"
                    icon={ThumbsDown}
                    active={interactionState.disliked}
                    pending={pendingAction === "disliked"}
                    disabled={pendingAction !== null}
                    onClick={() => void handleInteraction("disliked")}
                  />
                  <MovieActionButton
                    label="В обране"
                    activeLabel="Збережено"
                    icon={Star}
                    active={interactionState.favorite}
                    pending={pendingAction === "favorite"}
                    disabled={pendingAction !== null}
                    onClick={() => void handleInteraction("favorite")}
                  />
                  <MovieActionButton
                    label="Не цікаво"
                    activeLabel="Приховано"
                    icon={Ban}
                    active={interactionState.skipped}
                    pending={pendingAction === "skipped"}
                    disabled={pendingAction !== null}
                    onClick={() => void handleInteraction("skipped")}
                  />
                </div>
                <p className="max-w-3xl text-base leading-8 text-[#a78bba]">{book.description}</p>
              </div>
            </section>

            <BookRowSection title="Схожі книги" books={relatedBooks} />
          </div>
        </>
      )}
    </section>
  );
}
