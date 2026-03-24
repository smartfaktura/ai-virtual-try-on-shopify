import type { DiscoverItem } from '@/components/app/DiscoverCard';

/**
 * Get the URL-friendly slug for a discover item.
 * Presets use the DB-generated slug; scenes use "scene-{poseId}".
 */
export function getItemSlug(item: DiscoverItem): string {
  if (item.type === 'preset' && item.data.slug) {
    return item.data.slug;
  }
  // Fallback for presets without slug (shouldn't happen after backfill)
  if (item.type === 'preset') {
    return item.data.id;
  }
  return `scene-${item.data.poseId}`;
}

/**
 * Get the URL path for a discover item (public page).
 */
export function getItemUrlPath(item: DiscoverItem): string {
  return `/discover/${getItemSlug(item)}`;
}

/**
 * Get the URL path for a discover item (authenticated app page).
 */
export function getAppItemUrlPath(item: DiscoverItem): string {
  return `/app/discover/${getItemSlug(item)}`;
}
