import type { Listing } from "../schemas/listing";

export function withListingDetails<T extends Listing>(
  listing: T,
  latest?: Listing,
): T {
  if (!latest || latest.sourceId !== listing.sourceId) return listing;
  return {
    ...listing,
    thumbnailUrl: latest.thumbnailUrl ?? listing.thumbnailUrl,
    categories: latest.categories?.length
      ? latest.categories
      : listing.categories,
    website: latest.website ?? listing.website,
    phone: latest.phone ?? listing.phone,
    googleMapsRating: latest.googleMapsRating ?? listing.googleMapsRating,
    googleMapsReviews:
      latest.googleMapsReviews &&
      (!listing.googleMapsReviews ||
        Date.parse(latest.googleMapsReviews.checkedAt) >=
          Date.parse(listing.googleMapsReviews.checkedAt))
        ? latest.googleMapsReviews
        : listing.googleMapsReviews,
  };
}
