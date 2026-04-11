

# Add Status Actions to Card Hover Menu, Remove from Select Bar

## Changes

### 1. `src/components/app/LibraryImageCard.tsx`
- Add new prop: `onSetStatus?: (status: AssetStatus) => void`
- Add a **three-dot menu** (MoreHorizontal icon) to the hover overlay, positioned top-left
- Clicking it opens a small `DropdownMenu` with two items:
  - "Brand Ready" (Shield icon) — calls `onSetStatus('brand_ready')`
  - "Ready to Publish" (Send icon) — calls `onSetStatus('ready_to_publish')`
- Keep existing hover actions (heart top-right, download bottom-right, status pill bottom-left)

### 2. `src/pages/Jobs.tsx`
- **Remove** the "Brand Ready" and "Publish Ready" buttons from the floating select bar (lines ~625-649)
- **Pass** a new `onSetStatus` callback to each `LibraryImageCard` that calls `setStatus.mutate({ imageId, status })` with a toast
- The select bar keeps: `{n} selected`, Favorite, Enhance, Download, Delete, Close — much cleaner

## Result
- Individual cards get a clean three-dot menu on hover for status actions
- Select bar is shorter and less crowded
- Status actions are always one click away on any card without entering select mode

