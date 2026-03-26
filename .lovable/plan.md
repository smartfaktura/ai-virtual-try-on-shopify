

# Animate Image — Premium First Screen Redesign

## Current State
The pre-upload screen shows: PageHeader → tips banner → plain upload box with "Click to upload image" label. Too much empty space, no workflow guidance, no category awareness, no sense of intelligence.

## Redesigned Layout (pre-upload only)

```text
┌─────────────────────────────────────────────────────────┐
│  ← Video   Animate Image                               │
│  Turn a still product image into a polished commercial  │
│  video.                                                 │
├─────────────────────────────────────────────────────────┤
│  Category Chips Row (scrollable)                        │
│  [Fashion] [Beauty] [Jewelry] [Food] [Electronics] ... │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────┐  │
│  │  UPLOAD CARD          │  │  How it works           │  │
│  │  (Premium focal       │  │                         │  │
│  │   point)              │  │  1. Upload your image   │  │
│  │                       │  │  2. VOVV detects context│  │
│  │  Upload your product  │  │  3. Choose motion       │  │
│  │  image                │  │  4. Generate video      │  │
│  │                       │  │                         │  │
│  │  We'll detect         │  │  ─────────────────────  │  │
│  │  category, scene &    │  │  Best results tips      │  │
│  │  motion automatically │  │  • Clean, sharp images  │  │
│  │                       │  │  • One primary subject  │  │
│  │  [Upload zone]        │  │  • Well-lit photos      │  │
│  │                       │  │                         │  │
│  └──────────────────────┘  └─────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Smart Assistant Tip (VOVV.AI Studio + avatars)   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Changes to `src/pages/video/AnimateVideo.tsx`

### 1. Category Chips Row
Add a decorative row of category chips (from `PRODUCT_CATEGORIES`) below the header. Non-interactive, purely communicates ecommerce awareness. Small outline chips with Lucide icons matching the existing `ICON_MAP` pattern from `ProductContextSelector`.

### 2. Redesigned Upload Card
Replace the plain upload box with a premium card (`rounded-2xl border bg-card shadow-sm`):
- Headline: "Upload your product image" (text-base font-medium)
- Subline: "We'll detect category, scene type, and recommended motion automatically." (text-sm muted)
- Upload zone inside with larger icon, refined dashed border (`border-primary/20`), and subtle hover state
- The card is the left column in a two-column grid (`lg:grid-cols-[1fr_320px]`)

### 3. Right-Side "How It Works" + Best Results Panel
Right column contains two stacked sections:

**How It Works** — 4 vertical steps with numbered circles and short labels:
1. Upload image → `Upload` icon
2. VOVV detects context → `Brain` icon
3. Choose realistic motion → `Wand2` icon
4. Generate video → `Sparkles` icon

**Best Results** — Short tips list:
- Use clean, sharp product or campaign images
- Keep the main subject clearly visible
- Works best with one primary focus
- Ideal for fashion, beauty, jewelry, food, electronics

### 4. Move Tips Banner Below
Keep the VOVV.AI Studio tips banner but move it below the two-column area as a subtle footer hint rather than the first thing users see.

### 5. Widen Container
Already `max-w-4xl` from previous change — sufficient for two-column layout.

### Post-upload behavior
No changes to the post-upload form. Once an image is uploaded, the current flow (ProductContextSelector → MotionGoals → Settings → Generate) remains exactly as-is.

## Files to Modify
- `src/pages/video/AnimateVideo.tsx` — Restructure the pre-upload section (lines 369-403) into the new two-column premium layout with category chips, redesigned upload card, how-it-works panel, and best-results tips.

No new files needed. All changes are contained within the existing AnimateVideo component's pre-upload branch.

