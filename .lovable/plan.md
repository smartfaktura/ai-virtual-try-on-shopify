

## Premium Empty States with Team Avatars

Redesign the empty states on the Products page and Library (Jobs) page to feel spacious, premium, and on-brand with VOVV.AI's luxury aesthetic, featuring a team member avatar with a contextual message.

### Changes

**1. Upgrade EmptyStateCard component** (`src/components/app/EmptyStateCard.tsx`)

Add a new `teamMember` mode that shows:
- A team avatar (rounded, with subtle ring border) at ~64px
- A speech bubble quote from the team member (e.g., Sophia saying "I'm ready to photograph your first product!")
- The team member's name and role in small text below the avatar
- Much more vertical padding (py-20 instead of py-10) for spacious feel
- Larger, tracking-tight typography for heading
- Max-width constraint on description for editorial readability
- No card border -- use a borderless, background-only container for luxury feel

New props: `teamMember?: { name, role, avatar, quote }`

**2. Update Products empty state** (`src/pages/Products.tsx`)

Pass Sophia (Product Photographer) as the team member with quote: "Upload your first product and I'll handle the rest -- studio-quality shots, every angle."

**3. Update Library empty state** (`src/pages/Jobs.tsx`)

Pass Kenji (Campaign Art Director) as the team member with quote: "Your gallery is waiting. Start a workflow and I'll direct the shoot."

### Technical Details

**File: `src/components/app/EmptyStateCard.tsx`**
- Import `TeamMember` type from `@/data/teamData`
- Add optional `teamMember` prop with `{ name, role, avatar, quote }` shape
- When `teamMember` is provided, render:
  - Centered avatar image (w-16 h-16 rounded-full ring-2 ring-border)
  - Name + role below avatar in xs text
  - A styled quote bubble with the message (italic, text-muted-foreground, max-w-xs)
- Increase container padding to `py-16 sm:py-20`
- Make heading `text-xl font-semibold tracking-tight`
- Make description `text-sm text-muted-foreground max-w-md`
- Use `border-dashed border-border/50` on the card for a softer empty-state feel

**File: `src/pages/Products.tsx`**
- Import `TEAM_MEMBERS` from `@/data/teamData`
- Find Sophia and pass her data + a custom quote to EmptyStateCard

**File: `src/pages/Jobs.tsx`**
- Import `TEAM_MEMBERS` from `@/data/teamData`
- Find Kenji and pass his data + a custom quote to the empty state section (refactor inline empty state to use EmptyStateCard, or apply the same pattern inline)

