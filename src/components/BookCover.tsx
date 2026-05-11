import { useState, type ImgHTMLAttributes } from "react";
import { getBookImageUrl } from "@/utils/bookImages";
import { cn } from "@/utils/cn";

type BookCoverProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "onError"> & {
  imageUrl?: string | null;
  title: string;
  fallbackClassName?: string;
};

export function BookCover({
  imageUrl,
  title,
  className,
  fallbackClassName,
  loading = "lazy",
  ...props
}: BookCoverProps) {
  const src = getBookImageUrl(imageUrl);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasError = src ? failedSrc === src : false;

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={title}
        className={cn(
          "flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#2d1b4e,#1a0f2e_55%,#0d0719)] text-center",
          className,
          fallbackClassName,
        )}
      >
        <span className="line-clamp-3 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#e8d5f5]/80">
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
