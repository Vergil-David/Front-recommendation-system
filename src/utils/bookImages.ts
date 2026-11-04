const DEFAULT_OPENLIBRARY_COVER_BASE = "https://covers.openlibrary.org/b/id";

const openLibraryCoverBase =
  (import.meta.env.VITE_OPENLIBRARY_COVER_BASE as string | undefined)?.replace(/\/+$/, "") ||
  DEFAULT_OPENLIBRARY_COVER_BASE;

/**
 * Resolves a book cover image URL.
 *
 * Supports:
 * - Full absolute URLs (https://...)
 * - Protocol-relative URLs (//...)
 * - OpenLibrary cover IDs (plain numbers or paths like /12345-L.jpg)
 * - Data/blob URIs
 */
export function getBookImageUrl(imageUrl?: string | null): string | null {
  const trimmed = imageUrl?.trim();
  if (!trimmed) {
    return null;
  }

  // Protocol-relative
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  // Relative path — assume OpenLibrary cover
  if (trimmed.startsWith("/")) {
    return `${openLibraryCoverBase}${trimmed}`;
  }

  // Full URL
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    try {
      const url = new URL(trimmed);
      if (url.protocol === "http:") {
        url.protocol = "https:";
      }
      return url.toString();
    } catch {
      return null;
    }
  }

  // Assume bare filename/id — prepend OpenLibrary base
  return `${openLibraryCoverBase}/${trimmed.replace(/^\/+/, "")}`;
}
