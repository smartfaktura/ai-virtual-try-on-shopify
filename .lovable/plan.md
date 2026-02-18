
## Premium Empty States with CTAs -- Apple-Inspired Redesign

### Problem
The current empty states feel bare -- just a small avatar, a name, and a single line of text. No visual richness, no icon, and the Library page has no actionable CTAs to guide the user forward.

### New Design

A refined, spacious empty state with:
- A large, subtle icon in a soft rounded container (the visual anchor)
- Team member avatar small and inline below the icon (adds personality without dominating)
- A single clean message
- **Two CTA buttons** (Library) or **one CTA** (Products) styled as pill-shaped outline buttons for a premium feel

```text
      [ large icon container ]
      
         (small avatar)
          Team member name

    "Contextual message here."

   [ CTA Button 1 ]  [ CTA Button 2 ]
```

### Specific Changes

**File: `src/components/app/EmptyStateCard.tsx`**
- Redesign the `teamMember` mode layout:
  - Add a large icon container at top (w-20 h-20 rounded-3xl bg-muted/50) with a relevant icon passed via the existing `icon` prop
  - Below it, show the avatar smaller (w-10 h-10) with the name
  - Quote text stays as `text-[15px]` muted
  - Keep generous padding `py-20 sm:py-28`
- Add support for multiple actions: new `actions` prop as an array of `{ content, onAction, variant? }` for rendering multiple CTA buttons side by side
- When `actions` array is provided, render them in a flex row with gap; support `variant: 'default' | 'outline'`

**File: `src/pages/Products.tsx`**
- Pass a `Package` icon to the empty state
- Keep single "Add Product" CTA button

**File: `src/pages/Jobs.tsx` (Library)**
- Pass a `Image` icon (from lucide) to the empty state
- Add two CTA buttons:
  - "Explore Workflows" (outline variant) -- navigates to `/app/workflows`
  - "Freestyle Generation" (default variant) -- navigates to `/app/freestyle`
- Use `useNavigate` from react-router-dom for navigation

### Technical Detail

**EmptyStateCard props update:**
```typescript
actions?: Array<{
  content: string;
  onAction: () => void;
  variant?: 'default' | 'outline';
}>;
```

When `teamMember` is provided AND `icon` is provided, render:
1. Icon container (w-20 h-20 rounded-3xl bg-muted/50 with the icon at w-9 h-9)
2. Small avatar (w-10 h-10) + name text
3. Quote text
4. Actions row (flex gap-3, buttons with rounded-full styling)

The existing single `action` prop continues to work as before for backwards compatibility. The new `actions` array takes precedence when provided.

**Library page:** Import `useNavigate`, add two navigation CTAs. Remove inline empty state markup and use EmptyStateCard component instead.

**Products page:** Add Package icon to the EmptyStateCard call.
