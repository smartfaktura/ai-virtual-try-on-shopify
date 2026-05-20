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
  scenePreviewById?: Map<string, string>,
): string {
  if (!overrides) return fallbackUrl;
  const row = overrides.get(getOverrideKey(pageRoute, slotKey));
  if (!row) return fallbackUrl;
  // Prefer the live scene's current preview so admin updates to scene
  // previews propagate without re-picking in the SEO overrides admin.
  const live = scenePreviewById?.get(row.scene_id);
  if (live && live.trim()) return live;
  if (row.preview_image_url) return row.preview_image_url;
  return fallbackUrl;
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
 * Returns the visible hover-caption label for a SEO image slot.
 * Resolution order:
 * 1. The override scene's title from the public scene library (matches what
 *    the admin sees in the picker)
 * 2. The hardcoded fallback label
 *
 * NOTE: We intentionally do NOT use the override row's `alt_text` here —
 * `alt_text` is the SEO image alt (often a long descriptive sentence),
 * not a UI label. Use `resolveSlotAlt` for the `<img alt>` attribute.
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
  const title = sceneTitleById?.get(row.scene_id);
  if (title && title.trim()) return title;
  return fallbackLabel;
}
