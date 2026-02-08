

## Change "Workflows" Nav Link to "Team"

### What Changes

Update the landing page navigation so the first link says **"Team"** instead of "Workflows" and scrolls to the Studio Team section ("10 AI Professionals. Zero Overhead.") instead of the features section.

### Technical Details

**File: `src/components/landing/LandingNav.tsx`**

Two changes:

1. **Update the nav link label and target** (line 8):
   - Change `{ label: 'Workflows', href: '#features' }` to `{ label: 'Team', href: '#team' }`

2. **Add an `id` anchor to the Studio Team section** so the smooth scroll has a target:

**File: `src/components/landing/StudioTeamSection.tsx`**

- Add `id="team"` to the `<section>` element (line 65):
  - From: `<section className="py-20 sm:py-28 bg-muted/30">`
  - To: `<section id="team" className="py-20 sm:py-28 bg-muted/30">`

### Files Changed

| File | Action | Description |
|---|---|---|
| `src/components/landing/LandingNav.tsx` | Edit | Change "Workflows" label to "Team", href from `#features` to `#team` |
| `src/components/landing/StudioTeamSection.tsx` | Edit | Add `id="team"` to the section element |

