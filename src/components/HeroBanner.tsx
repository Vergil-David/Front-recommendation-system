import type { Movie } from "@/api/movies";

type HeroBannerProps = {
  movie: Movie;
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
};

export function HeroBanner({
  movie,
  eyebrow = "4.8 Rating Drama, Fiction",
  title,
  description,
  actions,
}: HeroBannerProps) {
  return (
    <div className="relative h-[500px] w-full overflow-hidden">
      <img src={movie.image_url} alt={movie.title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b2545] via-[#0b2545]/80 to-transparent backdrop-blur-md" />

      <div className="relative z-10 h-full">
        <div className="mx-auto flex h-full max-w-7xl items-center px-6 pt-16 pb-10">
          <div className="flex w-full flex-col gap-8 md:flex-row md:items-center md:gap-10">
            <img src={movie.image_url} alt={movie.title} className="w-40 rounded-xl object-cover shadow-xl" />

            <div>
              <p className="text-sm text-[#8da9c4]">{eyebrow}</p>
              <h1 className="mt-3 text-4xl font-bold text-[#eef4ed] md:text-5xl">{title ?? movie.title}</h1>
              <p className="mt-4 max-w-xl line-clamp-3 text-sm leading-6 text-[#8da9c4]">
                {description ?? movie.description}
              </p>

              {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
