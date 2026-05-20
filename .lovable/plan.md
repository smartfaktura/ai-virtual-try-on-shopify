## Change

Remove the "Source frame" pill from the In Progress video cards on `/app/video`. Keep the Processing/Queued pill, elapsed timer, ETA, and progress bar — those carry useful state.

## File

`src/components/app/video/RecentVideoCard` block inside `src/pages/VideoHub.tsx` (lines 153–158): delete the `<Badge>` rendering "Source frame". No other markup changes.
