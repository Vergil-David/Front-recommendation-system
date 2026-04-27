import { useState, type ImgHTMLAttributes } from "react";
import { getMovieImageUrl } from "@/utils/movieImages";
import { cn } from "@/utils/cn";

type MoviePosterProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "onError"> & {
  imageUrl?: string | null;
  title: string;
  fallbackClassName?: string;
};

export function MoviePoster({
  imageUrl,
  title,
  className,
  fallbackClassName,
  loading = "lazy",
  ...props
}: MoviePosterProps) {
  const src = getMovieImageUrl(imageUrl);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasError = src ? failedSrc === src : false;

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={title}
        className={cn(
          "flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#134074,#0b2545_55%,#061629)] text-center",
          className,
          fallbackClassName,
        )}
      >
        <span className="line-clamp-3 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#eef4ed]/80">
          {title}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      className={className}
      loading={loading}
      onError={() => {
        if (src) {
          setFailedSrc(src);
        }
      }}
      {...props}
    />
  );
}
