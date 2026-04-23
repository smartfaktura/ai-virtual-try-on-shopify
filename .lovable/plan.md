

## Polish "From Explore" section

### Two fixes

**1. Header now matches CREATIVE SHOTS exactly**

Current "PRE-SELECTED FROM EXPLORE" uses `text-primary` (blue). Change to `text-muted-foreground` to match `SubGroupSection` (line 917). Same font size, weight, tracking — just neutral color so it reads as a section label, not a badge.

**2. Explainer card matches SceneCard dimensions + adds a VOVV.AI avatar**

Current explainer is `aspect-[4/5]` with no footer, so it's visibly shorter than `SceneCard` (which is `aspect-[3/4]` image **+** a `min-h-[44px]` footer with title). Mismatch = the bottom edges don't line up.

Rebuild it to mirror SceneCard's exact two-part structure:
- Top: `aspect-[3/4]` block, dashed border, soft `bg-muted/20`, with a small **VOVV.AI team avatar** (32px circle, `border-primary/20 ring-1 ring-primary/10`, picked from `TEAM_MEMBERS` in `@/data/teamData` — same source used by `CatalogGenerate.tsx`) + a `Sparkles` badge corner. Centered tagline: "Picked for your product".
- Bottom: same `p-1.5 min-h-[44px]` footer block as SceneCard, holding "Add more shots below" in `text-[11px]` muted.

Result: both cards share identical outer height, border radius, and footer rhythm — they sit flush on the same baseline.

### File

```text
EDIT  src/components/app/product-images/ProductImagesStep2Scenes.tsx (lines 496–529)
        - Change header color: text-primary → text-muted-foreground
        - Rebuild explainer card to mirror SceneCard structure:
            • aspect-[3/4] preview region (dashed border, muted bg)
            • inside: VOVV avatar (TEAM_MEMBERS[0] or rotated) + Sparkles badge + tagline
            • p-1.5 min-h-[44px] footer with "Add more shots below"
        - Add import: TEAM_MEMBERS from '@/data/teamData'
        - Add import: Avatar, AvatarImage, AvatarFallback from '@/components/ui/avatar'
```

### Visual result

```text
PRE-SELECTED FROM EXPLORE ─────────────────────────  1 selected
┌──────────┐ ┌──────────┐
│  Frozen  │ │ ╭──╮ ✨   │
│   Aura   │ │ │👤│      │
│  [scene] │ │ ╰──╯      │
│          │ │ Picked   │
│          │ │ for you  │
├──────────┤ ├──────────┤
│Frozen Aura│ │Add more… │
└──────────┘ └──────────┘
   exact same height, exact same footer rhythm
```

### Out of scope

- No data, routing, or selection-logic changes.
- Other category sections untouched.

