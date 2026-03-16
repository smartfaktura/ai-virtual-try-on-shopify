

## Plan: Clean up Workflows page header — remove redundant pills, improve subtitle

### Problem
The subtitle already lists workflow types ("virtual try-ons, product listings, UGC selfies, flat lays, staging & more") and then the pills repeat the same info as clickable buttons. It feels cluttered and redundant.

### Approach
Replace the verbose subtitle + separate pills with a **short, clean subtitle** and keep the pills as the primary way to communicate what's available. The pills already serve as both navigation and content discovery — the subtitle doesn't need to repeat them.

### Changes

**`src/pages/Workflows.tsx`** (lines 347-367)

1. **Shorten the subtitle** to something like:  
   `"Pick a workflow to start generating — or jump to one below."`  
   This is concise, action-oriented, and doesn't duplicate the pill content.

2. **Remove the negative top margin** (`-mt-2`) on the pills container so they sit naturally below the subtitle with proper spacing.

That's it — two small tweaks. The pills stay (they're useful for scroll-to navigation), but the subtitle no longer repeats what they already show.

