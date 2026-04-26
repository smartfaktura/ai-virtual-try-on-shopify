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
