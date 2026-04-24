import type { DiscoverItem } from '@/components/app/DiscoverCard';

/**
 * Derive a CSS aspect-ratio string ("W / H") for a DiscoverItem so the masonry
 * grid can reserve the tile's final box BEFORE the image loads. This eliminates
 * layout shift while preserving the varied Pinterest-style sizes.
 *
 * - Presets: parse `data.aspect_ratio` (e.g. "3:4", "4:5", "1:1", "16:9").
 * - Scenes: default to "4 / 5" (the de-facto preview ratio).
 * - Malformed/missing: safe fallback "4 / 5".
 */
export function getDiscoverItemAspectRatio(item: DiscoverItem): string {
  if (item.type === 'preset') {
    const raw = item.data.aspect_ratio;
    if (raw && typeof raw === 'string') {
      const m = raw.match(/^\s*(\d+(?:\.\d+)?)\s*[:/x]\s*(\d+(?:\.\d+)?)\s*$/i);
      if (m) {
        const w = parseFloat(m[1]);
        const h = parseFloat(m[2]);
        if (w > 0 && h > 0) return `${w} / ${h}`;
      }
    }
    return '4 / 5';
  }
  return '4 / 5';
}

/**
 * Rotating CSS aspect-ratio strings used for masonry skeletons so the loading
 * state mirrors the vertical rhythm of the real grid (no "snap" on data arrival).
 */
export const MASONRY_SKELETON_RATIOS: string[] = [
  '4 / 5',
  '1 / 1',
  '3 / 4',
  '4 / 3',
  '2 / 3',
  '1 / 1',
  '4 / 5',
  '5 / 4',
];
