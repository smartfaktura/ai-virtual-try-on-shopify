

## Fix "Share to Discover" Visual Hierarchy and Context

### Issues identified

1. **Library modal**: Both "Download Image" and "Submit for Review" buttons use `bg-primary` — no visual distinction between the primary action and the promotional CTA
2. **Library modal**: No tooltip or explanation about how winners are selected (monthly random draw)
3. **Freestyle lightbox**: The "Share" button is just a plain pill with no context about the contest or credit prize — users have no idea why they'd click it

### Changes

**1. `src/components/app/LibraryDetailModal.tsx`** (lines 189-205)
- Change "Submit for Review" button to an **outline/ghost style** (`border border-primary/30 bg-transparent text-primary`) so it doesn't compete with the Download CTA
- Add a tooltip-style note below the subtitle: *"Each month we randomly select winners from submissions and award up to 10,000 credits."*
- Keep the Trophy icon and card styling

**2. `src/components/app/ImageLightbox.tsx`** (lines 162-170)
- Expand the Share button area to include a small promotional line visible in the lightbox
- Add a subtle info row above or below the action bar: a small Trophy icon + text *"Share to Discover — win up to 10,000 credits"* so users understand the value before clicking
- Keep the frosted-glass aesthetic consistent with other lightbox elements

