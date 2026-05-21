# Brand Models — chooser polish v2

Two issues to fix.

## 1. Bring back the page subtitle

When I removed the subtitle last turn it left the header feeling unfinished. Put a subtitle back — but make it match the chooser step, not the form step.

**Fix in `src/pages/BrandModelNew.tsx`:** restore the `<p>` under the H1 with new copy:

> Choose how you want to create this model

No terminal period (core rule).

## 2. Rebuild the two cards

Current cards have inconsistent heights (one title wraps to two lines, the other stays one line), the type hierarchy is flat, and they feel like text blocks rather than tappable choices.

**Fix in `src/pages/BrandModels.tsx` chooser block (~lines 907-944):**

- **Add an icon at the top** of each card — a 40×40 rounded-xl tile with a subtle bg (`bg-muted/60`) holding a Lucide icon. This anchors the card and instantly signals "button". Icons: `Sparkles` for Generate, `Camera` for Reference photo.
- **Equal heights** via `h-full` on the buttons + grid `items-stretch` so both cards always match regardless of text wrap.
- **Tighter, cleaner type hierarchy:**
  - Eyebrow: `text-[10px] tracking-[0.18em] uppercase text-muted-foreground/80` (slightly dimmer)
  - Title: `text-sm font-semibold text-foreground leading-snug` (was 15px medium — semibold reads more button-like)
  - Subtitle: `text-[13px] text-muted-foreground leading-relaxed`
  - "Start →" lives at the bottom, smaller and right-aligned at `text-[11px]` with the arrow nudge animation
- **Better internal spacing:** `p-5` (was `p-6` which felt empty), `gap-3` between icon → eyebrow → title → subtitle, then `mt-auto pt-5` pushing "Start →" to the bottom.
- **Card container:** use `flex flex-col` so the icon sits top, body grows, "Start →" hugs bottom.
- Keep narrower frame: `max-w-2xl mx-auto` and `gap-3` between cards.
- Hover stays as it is now (bg-muted/40, border-foreground/50, shadow-sm, arrow nudge).

### Sketch

```text
┌─────────────────────────┐  ┌─────────────────────────┐
│  [✨ icon tile]         │  │  [📷 icon tile]         │
│                         │  │                         │
│  01 / GENERATE          │  │  02 / REFERENCE PHOTO   │
│  Let VOVV.AI create     │  │  Generate a model from  │
│  a new model for you    │  │  a real person          │
│                         │  │                         │
│  Pick gender, age, look │  │  Upload a face — VOVV   │
│  — we generate from     │  │  .AI creates the model  │
│  scratch                │  │  based on it            │
│                         │  │                         │
│              Start  →   │  │              Start  →   │
└─────────────────────────┘  └─────────────────────────┘
```

## Out of scope

Reference / Manual panels, generation flow, navigation — untouched.
