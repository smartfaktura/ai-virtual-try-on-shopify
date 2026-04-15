

# Add Video Section to New User Dashboard

## What changes

After the "Steal the Look" section and before the Feedback Banner, add two new sections for first-time users:

### 1. "Create Video" — 2-card section
Based on the wireframe, show two cards side by side:

| Card | Title | Description | Badge | Route |
|------|-------|-------------|-------|-------|
| 1 | Animate from Image | Fast product videos from a single image | — | `/app/video/animate` |
| 2 | Short Films | Multi-shot video creation with guided scene structure | BETA | `/app/video/short-film` |

Section header: **"Create Video"** with subtitle **"Bring your visuals to life with motion and short film tools."**

Card 1 gets an "Open" button, Card 2 gets an "Explore" button. Same card style as the existing quick-start cards (`rounded-2xl border border-border bg-card p-6`). Grid: `grid-cols-1 sm:grid-cols-2 gap-4`.

### 2. Video Showcase grid
Reuse the same video showcase grid from `/app/video` (VideoHub.tsx lines 237-260) — a responsive grid of 10 looping video thumbnails with `aspect-[3/4]` cards. Section header: **"Your Products, In Motion"** with subtitle.

## File changed
- **`src/pages/Dashboard.tsx`** — Insert both sections between `<DashboardDiscoverSection />` (line 386) and `<FeedbackBanner />` (line 389). Add `Film`, `Clapperboard` icon imports. Add `Badge` import for the BETA tag.

