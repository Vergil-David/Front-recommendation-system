import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, Film, SkipForward, Sparkles } from "lucide-react";
import { getMovies, type Movie } from "@/api/movies";
import { createInteraction } from "@/api/recommendations";
import { useAuthStore } from "@/features/auth/authStore";
import { MoviePoster } from "@/components/MoviePoster";
import { cn } from "@/utils/cn";

const MIN_PICKS = 5;
const MOVIES_PER_PAGE = 100;

/** Mark onboarding as completed for a specific user. */
export function markOnboardingComplete(userId?: string) {
  if (userId) {
    localStorage.setItem(`onboarding_complete_${userId}`, "true");
  }
  // Also set a generic flag as fallback (if userId is unknown during early checks)
  localStorage.setItem("onboarding_complete", "true");
}

/** Check if the user has completed onboarding. */
export function isOnboardingComplete(userId?: string) {
  if (userId) {
    return localStorage.getItem(`onboarding_complete_${userId}`) === "true";
  }
  return localStorage.getItem("onboarding_complete") === "true";
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [appeared, setAppeared] = useState(false);

  // Redirect away if onboarding is already done
  useEffect(() => {
    if (isOnboardingComplete(user?.id)) {
      navigate("/home", { replace: true });
    }
  }, [user?.id, navigate]);

  // Trigger appear animation after mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAppeared(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Load movies ──
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMovies(1, MOVIES_PER_PAGE);
        if (!cancelled) {
          // Shuffle to give a fresh feel each time
          const shuffled = [...data.items].sort(() => Math.random() - 0.5);
          setMovies(shuffled);
        }
      } catch {
        if (!cancelled) setError("Не вдалося завантажити фільми. Спробуйте оновити сторінку.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  // ── Selection logic ──
  const toggleMovie = useCallback((movieId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(movieId)) {
        next.delete(movieId);
      } else {
        next.add(movieId);
      }
      return next;
    });
  }, []);

  const canContinue = selectedIds.size >= MIN_PICKS;

  // ── Submit selections ──
  const handleContinue = async () => {
    if (!canContinue || submitting) return;

    try {
      setSubmitting(true);
      // Send "liked" interaction for each selected movie
      const promises = Array.from(selectedIds).map((id) =>
        createInteraction(id, "liked").catch((err) =>
          console.error(`Failed to like movie ${id}`, err),
        ),
      );
      await Promise.all(promises);
      markOnboardingComplete(user?.id);
      navigate("/home", { replace: true });
    } catch {
      setError("Не вдалося зберегти ваш вибір. Спробуйте ще раз.");
      setSubmitting(false);
    }
  };

  // ── Skip handler ──
  const handleSkip = () => {
    markOnboardingComplete(user?.id);
    navigate("/home", { replace: true });
  };

  // ── Group movies by genre for visual variety ──
  const moviesByGenre = useMemo(() => {
    const genreMap = new Map<string, Movie[]>();
    const genreOrder: string[] = [];

    for (const movie of movies) {
      const genres = movie.genres?.length ? movie.genres : ["Інше"];
      for (const genre of genres) {
        if (!genreMap.has(genre)) {
          genreMap.set(genre, []);
          genreOrder.push(genre);
        }
        genreMap.get(genre)!.push(movie);
      }
    }

    // Filter to only genres with 3+ movies, take top genres
    return genreOrder
      .filter((g) => (genreMap.get(g)?.length ?? 0) >= 3)
      .slice(0, 8)
      .map((genre) => ({
        genre,
        movies: genreMap.get(genre)!.slice(0, 12),
      }));
  }, [movies]);

  // ── Flat list fallback if genres don't work well ──
  const flatMovies = movies.slice(0, 60);
  const useGenreView = moviesByGenre.length >= 3;

  return (
    <div className="relative min-h-screen bg-[#0b2545]">
      {/* ── Fixed header ── */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="glass-strong border-b border-white/5">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 md:px-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#134074] to-[#1d5a9e] shadow-[0_4px_16px_rgba(19,64,116,0.5)]">
                <Film className="h-5 w-5 text-[#eef4ed]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#eef4ed]">Підберемо для вас</h1>
                <p className="text-xs text-[#8da9c4]">Оберіть фільми, які вам подобаються</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Skip button */}
              <button
                type="button"
                onClick={handleSkip}
                className="group flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-[#8da9c4] transition-all duration-300 hover:bg-[#13315c] hover:text-[#eef4ed]"
              >
                Пропустити
                <SkipForward className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>

              {/* Counter pill */}
              <div
                className={cn(
                  "hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-500 sm:flex",
                  canContinue
                    ? "bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : "bg-[#13315c] text-[#8da9c4]",
                )}
              >
                <Sparkles className={cn("h-4 w-4", canContinue && "animate-pulse")} />
                <span>
                  {selectedIds.size} / {MIN_PICKS}
                </span>
              </div>

              {/* Continue button */}
              <button
                type="button"
                disabled={!canContinue || submitting}
                onClick={() => void handleContinue()}
                className={cn(
                  "group hidden items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-500 sm:flex",
                  canContinue
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_12px_32px_rgba(16,185,129,0.3)] hover:shadow-[0_16px_40px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-100"
                    : "cursor-not-allowed bg-[#13315c] text-[#8da9c4]/50",
                )}
              >
                {submitting ? "Зберігаємо..." : "Продовжити"}
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    canContinue && "group-hover:translate-x-0.5",
                  )}
                />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-[#13315c]/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out"
              style={{ width: `${Math.min((selectedIds.size / MIN_PICKS) * 100, 100)}%` }}
            />
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="relative pt-[88px] pb-24">
        {/* Hero section */}
        <section
          className={cn(
            "relative overflow-hidden px-6 py-12 md:px-10 md:py-16 transition-all duration-700",
            appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          )}
        >
          {/* Decorative gradient blobs */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#134074]/40 blur-[120px]" />
          <div className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-[#1d5a9e]/20 blur-[100px]" />

          <div className="relative mx-auto max-w-[1440px]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Крок 1 з 1
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold text-[#eef4ed] md:text-5xl lg:text-6xl">
              Що вам подобається?
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#8da9c4] md:text-lg">
              Оберіть щонайменше <span className="font-semibold text-[#eef4ed]">{MIN_PICKS} фільмів</span>,
              які вам подобаються — це допоможе нам зрозуміти ваші вподобання
              та підібрати найкращі рекомендації.
            </p>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="flex items-center gap-3 rounded-full bg-[#13315c]/80 px-6 py-3 text-[#eef4ed] backdrop-blur-xl">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#8da9c4] border-t-transparent" />
              Завантажуємо фільми...
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mx-auto max-w-md px-6 py-16 text-center">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-8 backdrop-blur-xl">
              <p className="text-base text-red-300">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full bg-[#134074] px-5 py-2 text-sm font-semibold text-[#eef4ed] transition hover:bg-[#1d5a9e]"
              >
                Оновити сторінку
              </button>
            </div>
          </div>
        )}

        {/* Movie grid — Genre-grouped or flat */}
        {!loading && !error && (
          <div className="mx-auto max-w-[1440px] space-y-12 px-6 md:px-10">
            {useGenreView
              ? moviesByGenre.map(({ genre, movies: genreMovies }, sectionIdx) => (
                  <section
                    key={genre}
                    className={cn(
                      "transition-all duration-700",
                      appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                    )}
                    style={{ transitionDelay: appeared ? `${200 + sectionIdx * 100}ms` : "0ms" }}
                  >
                    <h3 className="mb-5 text-xl font-bold text-[#eef4ed]">{genre}</h3>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 md:gap-4 lg:grid-cols-6 xl:grid-cols-8">
                      {genreMovies.map((movie, cardIdx) => (
                        <OnboardingCard
                          key={`${genre}-${movie.id}`}
                          movie={movie}
                          selected={selectedIds.has(movie.id)}
                          onToggle={toggleMovie}
                          delay={appeared ? 300 + sectionIdx * 80 + cardIdx * 30 : 0}
                          visible={appeared}
                        />
                      ))}
                    </div>
                  </section>
                ))
              : (
                <section>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 md:gap-4 lg:grid-cols-6 xl:grid-cols-8">
                    {flatMovies.map((movie, idx) => (
                      <OnboardingCard
                        key={movie.id}
                        movie={movie}
                        selected={selectedIds.has(movie.id)}
                        onToggle={toggleMovie}
                        delay={appeared ? 200 + idx * 25 : 0}
                        visible={appeared}
                      />
                    ))}
                  </div>
                </section>
              )}
          </div>
        )}
      </main>

      {/* ── Sticky bottom bar (mobile-friendly) ── */}
      <div className="fixed inset-x-0 bottom-0 z-50 sm:hidden">
        <div className="glass-strong border-t border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#8da9c4]">
              <Sparkles className={cn("h-4 w-4", canContinue && "text-emerald-400")} />
              <span>
                Обрано <span className="font-semibold text-[#eef4ed]">{selectedIds.size}</span> з {MIN_PICKS}
              </span>
            </div>
            <button
              type="button"
              disabled={!canContinue || submitting}
              onClick={() => void handleContinue()}
              className={cn(
                "flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300",
                canContinue
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_8px_24px_rgba(16,185,129,0.3)]"
                  : "bg-[#13315c] text-[#8da9c4]/50",
              )}
            >
              {submitting ? "Зберігаємо..." : "Продовжити"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Individual movie card ────────────────────────────────────

type OnboardingCardProps = {
  movie: Movie;
  selected: boolean;
  onToggle: (id: number) => void;
  delay?: number;
  visible?: boolean;
};

function OnboardingCard({ movie, selected, onToggle, delay = 0, visible = true }: OnboardingCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(movie.id)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2545]",
        selected
          ? "scale-[0.97] ring-2 ring-emerald-400 shadow-[0_0_28px_rgba(16,185,129,0.25)]"
          : "hover:scale-[1.03] hover:shadow-[0_18px_45px_rgba(19,64,116,0.3)]",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
      style={{
        transitionDelay: visible ? `${delay}ms` : "0ms",
        transitionProperty: "opacity, transform, box-shadow, scale, ring",
        transitionDuration: "500ms, 500ms, 300ms, 300ms, 300ms",
      }}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#13315c]">
        <MoviePoster
          imageUrl={movie.image_url}
          title={movie.title}
          className={cn(
            "h-full w-full object-cover transition-all duration-500",
            selected ? "brightness-50 saturate-75" : "group-hover:scale-105",
          )}
        />

        {/* Selection overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            selected ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-[0_8px_30px_rgba(16,185,129,0.45)]">
            <Check className="h-7 w-7 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Hover hint (unselected) */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-[#0b2545]/30 transition-all duration-300",
            selected ? "opacity-0" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/60 bg-white/10 backdrop-blur-sm">
            <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#081c35] via-[#081c35]/60 to-transparent" />
      </div>

      {/* Title */}
      <div className="bg-[#0d2b4d] px-2.5 py-2.5">
        <p className={cn(
          "line-clamp-2 text-xs font-semibold leading-4 transition-colors duration-300",
          selected ? "text-emerald-300" : "text-[#eef4ed]",
        )}>
          {movie.title}
        </p>
        {movie.release_year > 0 && (
          <p className="mt-0.5 text-[10px] text-[#8da9c4]/80">{movie.release_year}</p>
        )}
      </div>
    </button>
  );
}
