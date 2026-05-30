## Match Product Swap header pattern on video workflows

Align `/app/video/animate` and `/app/video/start-end` headers with the `/app/product-swap` pattern: a standalone ghost back button above the title, tighter subtitle, and unified vertical rhythm.

### Reference pattern (ProductSwap.tsx)
```text
[ ← Visual Studio ]              ghost button, -ml-2, above
Product Swap                     H1
Same scene, different product    short subtitle, no period
```

### AnimateVideo.tsx
- Remove `backAction` from `<PageHeader>`.
- Add standalone ghost back button above:
  ```tsx
  <Button variant="ghost" size="sm" onClick={() => navigate('/app/video')} className="gap-1.5 -ml-2 self-start">
    <ArrowLeft className="w-4 h-4" />Video
  </Button>
  ```
- Trim subtitle to: `Still image into a commercial video`.
- Outer container spacing: `space-y-5 sm:space-y-6` → `space-y-6`.

### StartEndVideo.tsx
- Setup view: drop `backAction`, add the same standalone ghost button above, keep `titleBadge={Beta}`, subtitle → `Cinematic transition between two frames`.
- Results view: add the same ghost back button above the header for consistency.
- Outer container: `space-y-6 sm:space-y-8` → `space-y-6`.

### Out of scope
- Global "You're out of credits" banner
- Right-rail cards, Batch Mode row, dropzone, stepper
- Any business logic

No new imports needed (`ArrowLeft`, `Button` already imported in both files).
