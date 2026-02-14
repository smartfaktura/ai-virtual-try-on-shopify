

## Remove Hover Tooltip Text from Scene Cards

### Problem
The scene cards in the Product Listing Set workflow show the full scene instruction/prompt text when hovering over them. This tooltip appears for admin users (which you are), displaying internal prompt details like "Seamless light gray studio sweep..." on hover.

### Solution
Remove the tooltip entirely from the scene cards — even for admin users. The scene label and category shown on the card itself is sufficient information.

### Changes

**File: `src/pages/Generate.tsx`**

1. Remove the admin-only tooltip wrapper (lines 1525-1537) so that all users — including admins — get the plain card without any hover text
2. The rendering will always return `<div key={i}>{cardContent}</div>` without any `Tooltip` wrapping
3. Clean up unused tooltip imports (`Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger`) if no longer used elsewhere in the file

### Result
- No hover text will appear on any scene card for any user
- Scene cards will still show the label and category directly on the card image overlay
- Admin-only features like the "Regenerate Previews" button remain unaffected

