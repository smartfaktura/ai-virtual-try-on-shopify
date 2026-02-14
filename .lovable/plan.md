

## Add Clarification Note to Scene Selection Section

### What Changes

**File: `src/pages/Generate.tsx` (line ~1451)**

Update the subtitle text under "Select Your Scenes" to include a note clarifying that the products shown in scene preview images are reference examples only, and VOVV Studio AI will generate scenes with the user's actual selected product.

Current text:
> "Choose scenes for your product — select at least 1"

New text:
> "Choose scenes for your product — select at least 1"
> (smaller helper text below): "Products shown are reference examples only. Our VOVV Studio AI team will generate each scene with your selected product."

This will be added as a second line in a smaller, muted style beneath the existing subtitle so it is clear but not visually overwhelming.

### Technical Detail

- Add a new `<p>` element with `text-xs text-muted-foreground/70` styling right after the existing subtitle (line ~1460)
- Only shown when `variationStrategy?.type === 'scene'` (i.e., the Product Listing Set workflow)
- No other files need changes
