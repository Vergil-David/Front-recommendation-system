const DEFAULT_TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const WIKIMEDIA_THUMB_STEPS = [20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840];

const tmdbImageBaseUrl =
  (import.meta.env.VITE_TMDB_IMAGE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ||
  DEFAULT_TMDB_IMAGE_BASE_URL;

function getNextWikimediaThumbStep(width: number) {
  return (
    WIKIMEDIA_THUMB_STEPS.find((step) => step >= width) ??
    WIKIMEDIA_THUMB_STEPS[WIKIMEDIA_THUMB_STEPS.length - 1]
  );
}

function normalizeWikimediaThumbnail(url: URL) {
  if (url.hostname !== "upload.wikimedia.org") {
    return url;
  }

  const thumbWidthMatch = url.pathname.match(/\/(\d+)px-(?=[^/]+$)/);
  if (!thumbWidthMatch) {
    return url;
  }

  const width = Number(thumbWidthMatch[1]);
  if (!Number.isFinite(width) || WIKIMEDIA_THUMB_STEPS.includes(width)) {
    return url;
  }

  const normalizedWidth = getNextWikimediaThumbStep(width);
  url.pathname = url.pathname.replace(`/${width}px-`, `/${normalizedWidth}px-`);
  return url;
}

export function getMovieImageUrl(imageUrl?: string | null) {
  const trimmed = imageUrl?.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return `${tmdbImageBaseUrl}${trimmed}`;
  }

  if (
    !/^https?:\/\//i.test(trimmed) &&
    !trimmed.startsWith("data:") &&
    !trimmed.startsWith("blob:")
  ) {
    return `${tmdbImageBaseUrl}/${trimmed.replace(/^\/+/, "")}`;
  }

  try {
    const url = normalizeWikimediaThumbnail(new URL(trimmed));
    if (url.protocol === "http:") {
      url.protocol = "https:";
    }
    return url.toString();
  } catch {
    return null;
  }
}
