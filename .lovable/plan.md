## Goal
Standardize corner radii across `/app/video/animate` so cards = `rounded-2xl`, inner buttons/tiles = `rounded-xl`, pills = `rounded-full`. Fix PRO badge clipping caused by the over-rounded `rounded-3xl` motion tile.

## Audit findings
| Element | Current | Issue |
|---|---|---|
| MotionGoalSelector card | `rounded-xl` | inconsistent with sibling card (`rounded-2xl`) |
| MotionGoalSelector item buttons (On-Body / Hold and Reveal / Wrist Detail) | `rounded-lg` | too sharp vs Motion Refinement tone |
| CameraMotionGrid tile | `rounded-3xl` | too round; PRO · 2× and check badges visibly clip out of the corner |
| CameraMotionGrid PRO badge | `rounded-md` at `top-1 left-1` | misaligned with rounder tile |
| CameraMotionGrid check dot | `top-1 right-1` | same alignment issue |

## Changes

### 1. `MotionGoalSelector.tsx`
- Line 19: outer card `rounded-xl` → `rounded-2xl`.
- Line 30: item button `rounded-lg` → `rounded-xl`.

### 2. `CameraMotionGrid.tsx`
- Line 94: tile `rounded-3xl` → `rounded-2xl` (matches Motion Refinement card; lets badges sit safely inside).
- Line 118: PRO badge `rounded-md` → `rounded-lg`, move from `top-1 left-1` → `top-1.5 left-1.5` so it tucks inside the rounded corner cleanly.
- Line 124: active check `top-1 right-1` → `top-1.5 right-1.5` for the same reason.

## Notes
- No logic changes.
- Final radii ladder: outer cards `rounded-2xl`, item rows/tiles `rounded-xl`–`rounded-2xl`, badges `rounded-lg`, status dots / cost pills / chips `rounded-full`.