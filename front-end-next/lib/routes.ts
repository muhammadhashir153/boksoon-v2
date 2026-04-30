import { Blog } from "./types";

export function donationDetailsPath(id: string) {
  return `/donation-details/${encodeURIComponent(id)}`;
}

export function blogDetailsPath(input: Pick<Blog, "slug" | "id"> | string) {
  const value =
    typeof input === "string"
      ? input
      : input.slug && input.slug.trim().length
        ? input.slug
        : input.id;

  return `/blogs/${encodeURIComponent(value)}`;
}
