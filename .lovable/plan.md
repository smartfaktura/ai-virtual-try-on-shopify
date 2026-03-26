

# Add Video Workflow Roadmap Cards

## Changes

### 1. `src/pages/VideoHub.tsx`
- Add two new cards: **Start & End Video** (between Animate Image and Create Ad Sequence) and **Short Film** (after Consistent Model Video)
- Import additional Lucide icons: `ArrowRightLeft` for Start & End Video, `Clapperboard` for Short Film
- Change grid from `md:grid-cols-3` to a responsive layout that handles 5 cards well — use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` so cards wrap naturally
- Card order: Animate Image → Start & End Video → Create Ad Sequence → Consistent Model Video → Short Film
- Start & End Video, Create Ad Sequence, Consistent Model Video, and Short Film all get `disabled` + `comingSoon`

New cards:
```tsx
<VideoWorkflowCard
  icon={ArrowRightLeft}
  title="Start & End Video"
  description="Create a smooth video between a start image and an end image."
  bestFor={['Product reveals', 'Before / after', 'Smooth transitions']}
  to="/app/video/start-end"
  disabled
  comingSoon
/>

<VideoWorkflowCard
  icon={Clapperboard}
  title="Short Film"
  description="Plan and generate a premium multi-shot brand film."
  bestFor={['Brand storytelling', 'Multi-shot', 'Campaign films']}
  to="/app/video/short-film"
  disabled
  comingSoon
/>
```

### 2. `src/components/app/video/VideoWorkflowCard.tsx`
- Improve the Coming Soon styling: instead of `opacity-50 cursor-not-allowed`, use `opacity-70` with slightly muted icon/text colors so cards feel aspirational rather than broken
- Add a subtle gradient or border treatment for Coming Soon cards to keep them visually distinct but premium (e.g., `border-dashed border-border/60`)

## Files
- `src/pages/VideoHub.tsx` — Add 2 new workflow cards, reorder, update grid
- `src/components/app/video/VideoWorkflowCard.tsx` — Refine Coming Soon styling from disabled-feeling to aspirational

