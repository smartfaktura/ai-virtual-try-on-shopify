

## Add BETA label to Short Film card

### Change
Add an optional `beta` prop to `VideoWorkflowCard`, then enable it on the Short Film card in `VideoHub`. Same top-right badge slot as `Coming Soon`, but styled as a subtle accent so it reads as "live but new" rather than "unavailable."

### Files

**`src/components/app/video/VideoWorkflowCard.tsx`**
- Add `beta?: boolean` prop.
- Render a `Badge` in the same top-right position when `beta` is true and `comingSoon` is false:
  ```tsx
  {beta && !comingSoon && (
    <Badge variant="secondary" className="absolute top-4 right-4 text-[10px] font-medium tracking-wide uppercase">
      Beta
    </Badge>
  )}
  ```
- No layout or interaction changes — card stays clickable.

**`src/pages/VideoHub.tsx`**
- Pass `beta` on the Short Film `<VideoWorkflowCard>` (line 228-234).

### Out of scope
- No changes to the Short Film page header itself, sidebar, or other workflow cards.
- No copy or routing changes.

### Result
Short Film card displays a small uppercase "BETA" pill in the top-right corner, matching the visual rhythm of the existing "Coming Soon" badge while remaining fully clickable.

