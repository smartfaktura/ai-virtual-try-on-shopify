

# Feedback Card Redesign — Match Platform Aesthetic

## Problem
The current `ContextualFeedbackCard` renders as a large white card at the top of the gallery, visually disconnected from the rest of the UI. It takes too much space and doesn't match the platform's notification style.

## Solution
Two changes:

### 1. Convert feedback into a compact notification pill (above prompt box)
Instead of a full card at the top of the gallery, show a small floating pill notification just above the prompt composer — exactly like the "Scene applied: Red Gradient Embrace" pill. This keeps the same visual language.

**Step 1 pill**: A compact rounded-full bar with the question + Yes/Almost/No inline buttons
```text
┌─────────────────────────────────────────────────────┐
│ 💬  How was this result?   [Yes] [Almost] [No]   ✕  │
└─────────────────────────────────────────────────────┘
```

**Step 2 (if Almost/No)**: Expand into a slightly larger but still compact panel above the prompt, with reason chips + optional text — styled with `bg-card/95 backdrop-blur` and a subtle border, matching the prompt box aesthetics.

**Success state**: Brief "Thanks" pill that auto-dismisses (same as scene hint pill).

### 2. Move placement from gallery top to above prompt composer
In `Freestyle.tsx`, remove the card from the gallery area (line ~1067-1080) and place it in the prompt panel area (around line 1124) alongside the scene hint. This positions it in the same visual zone as all other notification pills.

## Files to Edit

| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Redesign to compact pill/notification style. Step 1 is a single-line pill. Step 2 is a compact floating panel. Use `rounded-full` for step1, `rounded-xl` for step2, `bg-card/95 backdrop-blur-sm shadow-lg`. |
| `src/pages/Freestyle.tsx` | Move the `ContextualFeedbackCard` from gallery area to prompt panel area (next to scene hint, above the prompt composer). Position it as `absolute -top-14` or similar, matching the scene hint pattern. |

## Design Details
- Step 1 pill: `rounded-full bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg px-4 py-2 text-xs`
- Yes/Almost/No as small inline pills (not separate buttons), matching the scene hint compact feel
- Step 2 panel: `rounded-xl bg-card/95 backdrop-blur-sm border shadow-lg p-3` — reason chips + small textarea
- Dismiss X matches the scene hint's close button style
- "HELP US IMPROVE" label replaced with a simple `MessageSquare` icon inline
- All animations use the same `animate-in fade-in slide-in-from-bottom-2 duration-300`

