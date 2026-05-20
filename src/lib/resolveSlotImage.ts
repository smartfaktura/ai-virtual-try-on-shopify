import type { SeoVisualOverride } from '@/hooks/useSeoVisualOverrides';
import { getOverrideKey } from '@/hooks/useSeoVisualOverrides';

/**
 * Returns the URL to render for a SEO image slot. Always safe:
 * - If an override exists for (pageRoute, slotKey), returns its preview URL.
 * - Otherwise returns the provided fallback URL unchanged.
 *
 * SEO pages must continue to render their existing fallback images when
 * no override is configured or the override map is empty.
 */
export function resolveSlotImageUrl(
  overrides: Map<string, SeoVisualOverride> | undefined,
  pageRoute: string,
  slotKey: string,
  fallbackUrl: string,
): string {
  if (!overrides) return fallbackUrl;
  const row = overrides.get(getOverrideKey(pageRoute, slotKey));
  if (!row || !row.preview_image_url) return fallbackUrl;
  return row.preview_image_url;
}

export function resolveSlotAlt(
  overrides: Map<string, SeoVisualOverride> | undefined,
  pageRoute: string,
  slotKey: string,
  fallbackAlt: string,
): string {
  if (!overrides) return fallbackAlt;
  const row = overrides.get(getOverrideKey(pageRoute, slotKey));
  if (!row || !row.alt_text) return fallbackAlt;
  return row.alt_text;
}

/**
 * Returns the label to render for a SEO image slot's hover caption.
 * Resolution order:
 * 1. Admin-provided alt_text on the override row
 * 2. The override scene's title from the public scene library
 * 3. The hardcoded fallback label
 *
 * This keeps hover names in sync whenever an admin swaps a scene via
 * /app/admin/seo-page-visuals — no per-page code change required.
 */
export function resolveSlotLabel(
  overrides: Map<string, SeoVisualOverride> | undefined,
  pageRoute: string,
  slotKey: string,
  fallbackLabel: string,
  sceneTitleById?: Map<string, string>,
): string {
  if (!overrides) return fallbackLabel;
  const row = overrides.get(getOverrideKey(pageRoute, slotKey));
  if (!row) return fallbackLabel;
  if (row.alt_text && row.alt_text.trim()) return row.alt_text;
  const title = sceneTitleById?.get(row.scene_id);
  if (title && title.trim()) return title;
  return fallbackLabel;
}
