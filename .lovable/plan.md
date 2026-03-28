

# Multi-Image Navigation in Library Detail Modal for Workflow Recent Creations

## Problem
When a workflow job has 5 images (shown as "5 imgs" badge), clicking it opens the modal with only the first image. There's no way to browse the other 4 images within the modal.

## Approach
Add optional `items` + `currentIndex` props to `LibraryDetailModal` so it can show prev/next arrows when multiple images are available. The `WorkflowRecentRow` will convert all job results into `LibraryItem[]` and pass them.

## Changes

### 1. `src/components/app/LibraryDetailModal.tsx`
- Add optional props: `items?: LibraryItem[]`, `initialIndex?: number`, `onNavigate?: (item: LibraryItem) => void`
- When `items` is provided and has more than 1 entry, show left/right `ChevronLeft`/`ChevronRight` arrow buttons on the image panel
- Track `currentIndex` state internally, update displayed `item` from `items[currentIndex]`
- Add keyboard navigation: left/right arrow keys cycle through images
- Show a small "2 / 5" counter at the bottom of the image area
- All existing single-item usage remains unchanged (no `items` prop = current behavior)

### 2. `src/components/app/WorkflowRecentRow.tsx`
- When a thumbnail is clicked, extract ALL image URLs from `job.results` (not just the first)
- Sign all URLs for that job (expand the signing query to sign all result URLs, not just the first per job)
- Convert each result into a `LibraryItem` with unique id (`jobId-0`, `jobId-1`, etc.)
- Pass `items={allItems}` and `initialIndex={0}` to `LibraryDetailModal`

### 3. Signing all results
- Update the `useQuery` in `WorkflowRecentRow` to build a `signedAllUrlsMap: Record<string, string[]>` — mapping each job ID to an array of signed URLs for all its results, not just the first thumbnail
- The thumbnail display still uses only the first signed URL

## UI Details
- Arrow buttons: semi-transparent circles on the left/right edges of the image panel, only visible on hover (desktop) or always visible (mobile)
- Counter: small pill "2 / 5" centered below the image
- Keyboard: ArrowLeft/ArrowRight when modal is open with multiple items

