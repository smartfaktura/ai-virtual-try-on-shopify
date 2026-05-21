# Brand Models — chooser polish v2 (no icons)

Two issues to fix. No icons — pure typographic refinement.

## 1. Bring back the page subtitle

When I removed the subtitle last turn it left the header feeling unfinished. Restore it with copy that matches the chooser step.

**Fix in `src/pages/BrandModelNew.tsx`:** put a `<p>` back under the H1:

> Choose how you want to create this model

No terminal period (core rule).

## 2. Rebuild the two cards (typography + spacing, no icons)

Current cards have inconsistent heights (one title wraps to two lines, the other stays one line), the type hierarchy is flat, and the rhythm feels loose.

**Fix in `src/pages/BrandModels.tsx` chooser block (~lines 907-944):**

- **Equal heights:** add `h-full` on the buttons + `items-stretch` on the grid so both cards always match regardless of text wrap.
- **Vertical composition:** `flex flex-col` on each button so "Start →" can hug the bottom via `mt-auto`.
- **Refined type hierarchy:**
  - Eyebrow: `text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70 font-medium` — slightly dimmer, tighter tracking
  - Title: `text-[15px] font-semibold text-foreground leading-snug tracking-tight` — semibold reads more decisive than medium
  - Subtitle: `text-[13px] text-muted-foreground/90 leading-relaxed`
  - "Start →": `text-[11px] tracking-wide uppercase text-muted-foreground group-hover:text-foreground`, with the arrow nudge
- **Rhythm:** eyebrow `mb-2`, title `mb-1.5`, subtitle natural flow, then `mt-auto pt-6` to push Start to the bottom.
- **Padding:** `p-6` stays, but add a clear top accent space so the eyebrow doesn't crowd the top edge.
- **Frame:** keep `max-w-2xl mx-auto`, bump grid gap from `gap-4` to `gap-3` for a tighter pair.
- **Hover:** unchanged (bg-muted/40, border-foreground/50, shadow-sm, arrow nudge).

### Sketch

```text
┌─────────────────────────┐  ┌─────────────────────────┐
│                         │  │                         │
│  01 / GENERATE          │  │  02 / REFERENCE PHOTO   │
│  Let VOVV.AI create     │  │  Generate a model from  │
│  a new model for you    │  │  a real person          │
│  Pick gender, age, look │  │  Upload a face — VOVV   │
│  — we generate from     │  │  .AI creates the model  │
│  scratch                │  │  based on it            │
│                         │  │                         │
│  START  →               │  │  START  →               │
└─────────────────────────┘  └─────────────────────────┘
```

## Out of scope

Reference / Manual panels, generation flow, navigation — untouched.
