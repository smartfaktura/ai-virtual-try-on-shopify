

## Auto-Fill Discover Details with AI

### Problem
When adding an image to Discover, admins must manually type a title, pick a category, and add tags. This is tedious -- the AI can analyze the image and pre-fill all three fields instantly, while still allowing edits.

### Solution
When the modal opens, automatically call an edge function that analyzes the image and returns a short title, best-matching category, and 3-5 tags. The fields are pre-filled but fully editable. A small loading shimmer shows while AI is working.

### Changes

**1. New edge function: `supabase/functions/describe-discover-metadata/index.ts`**
- Accepts `imageUrl` and `prompt` (the generation prompt is already available)
- Calls Lovable AI (`google/gemini-2.5-flash`) with the image + prompt
- Uses tool calling to extract structured output:
  - `title`: string, max 40 chars, short and catchy
  - `category`: one of the 6 existing categories (cinematic, commercial, photography, styling, ads, lifestyle)
  - `tags`: array of 3-5 single-word lowercase tags
- Returns JSON `{ title, category, tags }`
- Handles 429/402 rate limit errors gracefully

**2. Update `src/components/app/AddToDiscoverModal.tsx`** (admin modal)
- On mount (when `open` becomes true), call the new edge function via `supabase.functions.invoke`
- Show a subtle shimmer/skeleton on the title input and tag area while loading
- When AI responds, pre-fill `title`, `category`, and `tags` state
- All fields remain fully editable -- user can change anything
- If AI fails, fields stay empty (current behavior) with no error toast blocking the flow

**3. Update `src/components/app/SubmitToDiscoverModal.tsx`** (user submission modal)
- Same auto-fill logic as above -- call the edge function when the modal opens
- Pre-fill title, category, and tags with AI suggestions
- All fields remain editable

### UX Flow
1. User/admin clicks "Add to Discover" or "Submit to Discover"
2. Modal opens with image preview and a shimmer animation on the form fields
3. Within 1-2 seconds, AI fills in a short title, selects the best category, and adds relevant tags
4. User reviews, optionally edits, and clicks Publish/Submit

### Technical Details

| What | Detail |
|------|--------|
| AI Model | `google/gemini-2.5-flash` (fast, cheap, good for classification) |
| Structured output | Tool calling with `suggest_discover_metadata` function schema |
| Prompt strategy | Pass both the image URL and the generation prompt for better context |
| Title length | AI instructed to keep under 40 chars, enforced by existing 60-char UI limit |
| Fallback | If AI call fails, fields stay empty -- no blocking errors |
| Both modals | `AddToDiscoverModal` (admin) and `SubmitToDiscoverModal` (user) get the same treatment |

