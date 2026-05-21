# Brand Models — fix chooser spacing & alignment

## What's wrong

- Cards wrapped in `max-w-2xl mx-auto` inside a `max-w-3xl mx-auto` parent → cards sit narrower than and offset from the page title above them. Looks misaligned.
- `min-h-[180px]` + `flex justify-between` shoves the "Start →" link far below the title with a dead gap in between.
- `p-8` is too much for the actual content density.

## Fix

**File:** `src/pages/BrandModels.tsx`, chooser block (~lines 905-944). No other changes.

- Drop `max-w-2xl mx-auto` on the grid. Use `w-full` so the cards align flush with the "New brand model" header and span the same width.
- Drop `min-h-[180px]` and the `flex flex-col justify-between` layout.
- Use natural height: padding `p-6`, content stack with `space-y-6`, "Start →" sits one rhythmic step below the title — not glued to the bottom.
- Add a touch of top spacing (`pt-2`) so the chooser doesn't kiss the subtitle.

### Final card structure

```tsx
<button className="group text-left rounded-2xl border border-border/50 bg-card p-6 hover:border-foreground/40 transition-colors duration-200">
  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">01 / Reference</p>
  <p className="text-[15px] font-medium text-foreground leading-snug mb-6">
    Re-photograph a real person from a photo
  </p>
  <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
    Start →
  </p>
</button>
```

Grid: `grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-2`.

## Out of scope

Chooser only. Downstream panels, consent, generation untouched.
