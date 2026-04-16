

# Remove Old FeedbackBanner from Virtual Try-On Set Page

## Problem
The `/app/generate/virtual-try-on-set` page shows both the `ContextualFeedbackCard` (new survey) and the `FeedbackBanner` (old "Help us improve VOVV.AI / Share feedback" popover) at the bottom. The user wants only the new `ContextualFeedbackCard` shown — remove the old `FeedbackBanner` from this page.

## Change

### `src/pages/Generate.tsx` — Line 4564
Remove the `<FeedbackBanner />` call at the bottom of the page. The `ContextualFeedbackCard` (lines 4497-4514) already provides the feedback mechanism with the matching banner style.

This is a single line removal.

