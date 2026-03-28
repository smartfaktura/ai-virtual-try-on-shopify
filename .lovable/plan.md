

# Fix Thumbnail Strip Overflow

## Problem
The mini-thumbnail strip shows 4 thumbs (28px each) + a "+N" pill, which overflows the 130-140px card width.

## Fix — `src/components/app/WorkflowRecentRow.tsx`

1. **Reduce `MAX_MINI_THUMBS` from 4 to 3** — this guarantees space for the "+N" pill within the card width (3 × 28px + gaps + pill ≈ ~130px)
2. **Make mini-thumbs slightly smaller**: change from `w-7 h-7` (28px) to `w-6 h-6` (24px) — fits 3 thumbs + overflow pill comfortably in all card widths

This ensures the strip always fits regardless of whether there are 2, 5, or 10+ images.

