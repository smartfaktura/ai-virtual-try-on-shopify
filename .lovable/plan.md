# Fix Brand Scenes page UI/UX

Two surgical fixes to `src/pages/BrandScenes.tsx`. Frontend-only, no logic, schema, or routing changes.

## 1. Header — align "New brand scene" button

Current: `flex flex-wrap items-end justify-between` causes the button to align to the bottom of the subtitle, and on narrow screens it wraps below in an inconsistent way.

Change to:
- `items-start` so the button aligns with the **title baseline** (top), matching other pages in the app (Library, Workflows).
- Keep `justify-between` and `flex-wrap` so it still stacks gracefully on mobile.
- Add `shrink-0` to the button so it never gets squeezed.

## 2. Scene card — actions always visible, no overlap

Current problems:
- `absolute inset-x-0 bottom-0 … opacity-0 group-hover:opacity-100` overlay sits **on top of** the title/date and is invisible on touch devices.
- Title "Untitled" is being covered by the gradient even at rest in the screenshot (z-stacking + overlay padding).

New structure (no hover dependency):

```text
┌─────────────────────────┐
│      4:5 image          │
│                         │
│                         │  ← trash icon top-right, subtle, always visible
└─────────────────────────┘
│ Title                   │
│ Date · module           │
│ ┌──────────────┐        │
│ │ ✨ Use scene │        │  ← primary action, full-width on mobile, auto on desktop
│ └──────────────┘        │
└─────────────────────────┘
```

Specifically:
- Remove the absolute-positioned bottom overlay entirely.
- Move **trash** to a small floating button in the **top-right corner of the image** (`absolute top-2 right-2`, `bg-background/80 backdrop-blur`, always visible but discreet; opacity bumps on hover).
- Put **"Use scene"** as a normal block-level button inside the text section beneath the title/date — `w-full` on mobile, `w-auto` on `sm:` so it doesn't stretch awkwardly on desktop cards.
- Keep image hover zoom (`group-hover:scale-[1.03]`) for the visual polish.
- Card padding bumps from `p-3` to `p-3.5` to make room for the action without feeling cramped.

## Files

- `src/pages/BrandScenes.tsx` — header flex alignment + `SceneCard` restructure (sections 81–97 and 140–205).

## Out of scope

- Empty state, delete confirmation dialog, query logic, navigation targets, and routing all stay as-is.
