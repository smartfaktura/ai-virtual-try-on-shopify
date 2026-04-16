

# Brand-Refine Layer 1 Card + Add VOVV Avatar

## Problem
The current card looks clean but generic — it could belong to any SaaS. It lacks VOVV identity and feels impersonal. The value blocks are visually heavy with thick borders, and the overall card doesn't connect to the "AI studio team" brand that VOVV uses elsewhere.

## Solution
Add a VOVV team avatar to the card header and refine the visual design to match VOVV's luxury restraint aesthetic.

### 1. Add Team Avatar to Header

Use the existing `TEAM_MEMBERS` data — pick a contextually relevant avatar based on category. For example, Sophia (E-commerce Photographer) for product shots, Amara (Lifestyle Scene Photographer) for lifestyle categories. The avatar appears as a small 28px circle next to the success message, making it feel like a team member is congratulating them.

```text
┌──────────────────────────────────────────────────┐
│ [avatar] First fashion direction — complete   [×]│
│          Keep creating with more credits...      │
│                                                  │
│   Create More    ·   Better Value   ·  Faster    │
│   Monthly credits    Lower cost/img    Priority  │
│                                                  │
│   [See Plans & Features]          Maybe Later    │
└──────────────────────────────────────────────────┘
```

### 2. Visual Refinements

- **Avatar**: 28px rounded-full with subtle ring, pulled from `TEAM_MEMBERS` based on category mapping (fashion → Sophia, beauty → Luna, etc.)
- **Value blocks**: Remove visible borders, use subtler `bg-muted/30` backgrounds with no border — feels lighter, more premium
- **Icon containers**: Reduce to `bg-primary/5` (currently `/8`), smaller padding
- **Typography**: Ensure Inter 400-500 weights only (no 600/semibold on detail text)
- **Card border**: Keep left accent but soften to `border-l-primary/60` instead of full primary
- **Spacing**: Tighten value block internal padding slightly for a more compact, editorial feel

### 3. Category → Avatar Mapping

Add a simple mapping in `conversionCopy.ts`:

| Category | Team Member | Reason |
|----------|-------------|--------|
| fashion | Sophia | E-commerce Photographer |
| beauty | Luna | Retouch Specialist |
| jewelry | Sophia | Studio lighting expert |
| fragrances | Amara | Lifestyle scenes |
| food | Amara | Lifestyle scene specialist |
| electronics | Kenji | Tech product specialist |
| home | Amara | Lifestyle contexts |
| accessories | Sophia | E-commerce focus |
| fallback | Sophia | Default studio lead |

### Files to Change

| File | Change |
|------|--------|
| `src/components/app/PostGenerationUpgradeCard.tsx` | Add avatar from team data, refine value block styling (remove borders, lighter bg), soften card accent, adjust typography weights |
| `src/lib/conversionCopy.ts` | Add `getLayer1Avatar(category)` function returning team member name + avatar URL |
| `src/pages/AdminConversion.tsx` | Update preview to show which avatar is selected for current category |

### Design Details
- Avatar uses `getLandingAssetUrl('team/avatar-sophia.jpg')` etc. — same CDN as the team carousel
- Quality-only optimization via `getOptimizedUrl(url, { quality: 60 })` per existing image optimization rules
- On mobile, same layout — avatar is small enough to not cause reflow issues

