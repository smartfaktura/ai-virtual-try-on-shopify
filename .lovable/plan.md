

## Show Only User Prompt + Truncate in Freestyle Detail Modal

### Problem
When opening a freestyle image in the detail modal, perspective-generated images show the full engineered prompt (e.g., "Generate a photorealistic product image from the specified angle/perspective..."). Users should only see their own prompt, and long prompts should be truncated.

### Approach
Two changes:

**1. `src/components/app/LibraryDetailModal.tsx`** — Truncate the prompt display with a "Show more" toggle:
- Default: show first ~150 characters with ellipsis
- Click "Show more" to expand the full text
- This handles all cases gracefully (perspective prompts, long user prompts, short prompts)

**2. `src/pages/Freestyle.tsx`** — Pass the user's actual typed prompt instead of what's stored in DB:
- The freestyle page already has the user's `prompt` state variable
- For the lightbox item, we can use `img.prompt` but it's already the user prompt for regular freestyle
- For perspective-generated images (which store engineered prompts), we strip the engineered prefix by detecting known patterns like "Generate a photorealistic product image" and falling back to a clean label like "Perspectives generation"

### Detailed changes

**`src/components/app/LibraryDetailModal.tsx`** (~10 lines):
- Add a `promptExpanded` state
- In the prompt section (lines 163-172), truncate to ~150 chars when collapsed
- Add a small "Show more" / "Show less" toggle button
- Reset `promptExpanded` when item changes

**`src/pages/Freestyle.tsx`** (~3 lines):
- When building `lightboxItem`, sanitize the prompt: if it starts with known engineered prefixes (like "Generate a photorealistic"), replace with just the user-facing product title or a generic "Perspectives" label
- Simple regex/startsWith check on `img.prompt`

