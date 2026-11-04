import type { Movie } from "@/api/movies";
import { MoviePoster } from "@/components/MoviePoster";

type HeroBannerProps = {
  movie: Movie;
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
};

export function HeroBanner({
  movie,
  eyebrow = "Вибір редакції",
  title,
  description,
  actions,
}: HeroBannerProps) {
  return (
    <section className="relative h-[82vh] min-h-[620px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <MoviePoster
          imageUrl={movie.image_url}
          title={movie.title}
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
            <MoviePoster
              imageUrl={movie.image_url}
              title={movie.title}
              className="hidden aspect-[2/3] w-44 shrink-0 rounded-lg object-cover soft-depth md:block lg:w-52"
              loading="eager"
            />

            <div className="max-w-3xl pb-1">
              <p className="animate-fade-in text-sm font-semibold uppercase tracking-[0.24em] text-[#8da9c4]">
                {eyebrow}
              </p>
              <h1 className="font-display mt-4 max-w-4xl animate-fade-in-up text-5xl font-bold leading-tight text-[#eef4ed] md:text-6xl lg:text-7xl">
                {title ?? movie.title}
              </h1>
              <p className="mt-5 max-w-2xl animate-fade-in line-clamp-3 text-base leading-7 text-[#8da9c4]">
                {description ?? movie.description}
              </p>

              {actions ? (
                <div className="mt-8 flex animate-fade-in flex-wrap items-center gap-3">
                  {actions}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
