

## Remove Use-Case Labels from Aspect Ratio Selector

Remove the platform-specific subtitles ("Instagram & Listings", "Stories & Pinterest", "Reels & TikTok", "Banners & Facebook") from the aspect ratio selector buttons. Keep only the ratio visual and label (Square, Portrait, Story, Wide).

### Changes

**File: `src/components/app/AspectRatioPreview.tsx`**
- Remove `useCase` from `ratioConfig`
- Remove the `<p>` rendering `config.useCase` (line 32)
- Remove subtitle "Choose the best size for where you'll use the image" (line 46)

