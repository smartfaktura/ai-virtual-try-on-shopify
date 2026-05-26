## Changes to `/app/perspectives` results view

### 1. Button sizing consistency
In `src/pages/Perspectives.tsx`, the **View in Library** button currently uses `variant="ghost" size="sm"`, making it smaller than the adjacent **Generate more** button which uses `size="pill"`.

Fix: change `View in Library` to `variant="outline" size="pill"` so both buttons share the same height and shape.

### 2. Re-order feedback card
The `ContextualFeedbackCard` is currently rendered **above** the CTA button row (Generate more / View in Library). Move it **below** the CTA buttons so the primary actions appear first.