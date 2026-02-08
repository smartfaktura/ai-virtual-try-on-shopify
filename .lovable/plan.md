

# Graceful Content Policy Handling

## Problem

When a user submits a prompt that triggers the AI's content safety filter, the edge function receives a text-only response (no image) with a refusal message like "I cannot fulfill this request." Currently this cascades into a 500 error that crashes the app with an error overlay.

## Solution

Handle content policy violations across three layers so the user sees a clear, styled "Content Blocked" card in the gallery instead of a crash.

---

## Changes

### 1. Edge Function: `supabase/functions/generate-freestyle/index.ts`

Detect content policy refusals and return them with a distinct error type instead of a generic 500.

- In the `generateImage` function, when no image is returned, check the response for content policy signals:
  - `finish_reason === "IMAGE_PROHIBITED_CONTENT"` (from the AI gateway)
  - Response `content` containing refusal language like "I cannot fulfill" or "inappropriate"
- When detected, return a structured object instead of `null`: `{ blocked: true, reason: "..." }`
- In the main handler loop, collect blocked results alongside successful images
- Return a new response shape when all images are blocked:

```json
{
  "images": [],
  "generatedCount": 0,
  "requestedCount": 1,
  "contentBlocked": true,
  "blockReason": "This prompt was flagged by our content safety system. Try rephrasing with different terms."
}
```

This returns a 200 (not 500), so the frontend can handle it gracefully.

### 2. Hook: `src/hooks/useGenerateFreestyle.ts`

- Update `FreestyleResult` interface to include optional `contentBlocked: boolean` and `blockReason: string` fields
- After receiving the result, check for `contentBlocked` -- if true, show a warning toast instead of success, and return the result (not null) so the page component can act on it

### 3. Page: `src/pages/Freestyle.tsx`

- After `generate()` returns, check `result.contentBlocked`
- If blocked, instead of saving images, add a "blocked" placeholder to the gallery state
- Track blocked entries via a new `useState<BlockedEntry[]>` that stores `{ id, prompt, reason, timestamp }`
- Pass these to the gallery as a new `blockedEntries` prop
- Blocked entries can be dismissed (deleted) by the user

### 4. Gallery: `src/components/app/freestyle/FreestyleGallery.tsx`

Add a new `ContentBlockedCard` component that renders in place of an image:

**Visual design:**
- Same size as a regular image card (fills grid cell or matches flex layout)
- Soft red/rose gradient background with a subtle border
- Centered `ShieldAlert` icon (from lucide-react) in a muted red tone
- Title: "Content Blocked"
- Subtitle: The block reason text (e.g., "This prompt was flagged by our content safety system.")
- A small "Dismiss" button at the bottom to remove the card
- The prompt text shown in small muted text so the user knows which request was blocked

**Props update:**
- Add `blockedEntries?: Array<{ id: string; prompt: string; reason: string }>` to `FreestyleGalleryProps`
- Add `onDismissBlocked?: (id: string) => void` callback

**Layout:**
- Blocked cards render in the same position as generating/image cards
- In centered mode (count <= 3): same flex sizing as images
- In grid mode: fills the grid cell like a normal image

---

## Technical Details

### Edge function `generateImage` return type change

Currently returns `string | null`. Change to `string | { blocked: true; reason: string } | null`.

When the AI gateway response has no image:
1. Check `data.choices[0].finish_reason` -- if it contains "PROHIBITED" or "BLOCKED", it's a content policy issue
2. Check `data.choices[0].message.content` -- if it contains refusal text, extract it as the reason
3. Return `{ blocked: true, reason: extractedReason }` instead of retrying

### ContentBlockedCard component

```text
+---------------------------------------+
|                                       |
|         [ShieldAlert icon]            |
|                                       |
|        Content Blocked                |
|                                       |
|   This prompt was flagged by our      |
|   content safety system.              |
|                                       |
|   "blonde nude women..."  (prompt)    |
|                                       |
|        [Dismiss]  [Edit Prompt]       |
|                                       |
+---------------------------------------+
```

- Background: `bg-gradient-to-br from-red-500/5 via-rose-500/10 to-red-500/5`
- Border: `border border-red-200/30`
- Icon color: `text-red-400/60`
- "Edit Prompt" button copies the blocked prompt back to the editor for rephrasing

### Files changed

1. `supabase/functions/generate-freestyle/index.ts` -- Detect content blocks, return structured response
2. `src/hooks/useGenerateFreestyle.ts` -- Handle `contentBlocked` in result
3. `src/pages/Freestyle.tsx` -- Track blocked entries, pass to gallery
4. `src/components/app/freestyle/FreestyleGallery.tsx` -- Add `ContentBlockedCard`, render blocked entries

