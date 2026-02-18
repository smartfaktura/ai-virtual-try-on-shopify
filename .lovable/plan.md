

## Simplify Empty States -- Less Text, Unified Hierarchy

### Problem
The current empty states have **5 separate text elements** stacked vertically (name, role, quote, heading, description), creating a cluttered, mixed-sizing feel. It doesn't match the Apple-inspired minimalism of VOVV.AI.

### New Design
Strip it down to just **3 elements**: avatar, one single message, and the CTA button. The team member's quote becomes the only text -- no separate heading, no separate description, no name/role labels cluttering the space.

```text
        [avatar]
   [team member name]

  "Single clean message"

      [ Button ]
```

### Specific Changes

**File: `src/components/app/EmptyStateCard.tsx`**
- When `teamMember` is provided, simplify to just:
  - Avatar (w-14 h-14, rounded-full, subtle ring)
  - Name only in small muted text (drop the role -- less clutter)
  - Quote as the single message in `text-[15px] text-muted-foreground` (not italic, cleaner)
  - Remove the separate `heading` and `description` display when teamMember is active
- Increase vertical padding to `py-20 sm:py-28` for more breathing room
- Use `space-y-4` between elements (not space-y-5)
- Drop the border entirely (`border-0`) for a cleaner, more invisible container

**File: `src/pages/Products.tsx`**
- Simplify the quote to be the complete message: "Upload your first product to start creating studio-quality visuals."
- Remove the separate heading/description since the quote covers it
- Keep the "Add Product" CTA button

**File: `src/pages/Jobs.tsx` (Library)**
- Simplify Kenji's quote to: "Start a workflow to build your creative library."
- Remove the separate heading/description
- No CTA button needed (already none for library)

### Result
Each empty state goes from 5 text elements to 2 (name + quote), feeling dramatically more spacious and premium across mobile, tablet, and desktop.

