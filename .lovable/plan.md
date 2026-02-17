

## Create a Dedicated "Meet the Team" Page

### Overview
A new standalone `/team` page featuring all 10 AI Studio Team members with their living avatar videos, roles, and descriptions. The design follows an Apple-inspired, luxury, spacious layout with generous whitespace and editorial typography. The page ends with relevant CTAs and a contact section.

### Page Structure

1. **Hero Section** -- Full-width, centered headline with a subtle badge. Large, airy typography:
   - Badge: "Your AI Studio Team"
   - Headline: "10 AI Professionals. Zero Overhead."
   - Subheadline: Brief one-liner about the team

2. **Team Grid** -- A responsive grid (2 cols mobile, 3 cols tablet, 4-5 cols desktop) of team member cards. Each card:
   - Large rounded video element (aspect 4:5) with `poster` fallback, `autoPlay`, `muted`, `loop`, `playsInline`, `preload="none"` (per project conventions)
   - Subtle hover scale effect and border highlight
   - Name, role (in primary color), and description below

3. **CTA Section** -- Bottom area with:
   - Primary CTA: "Start Creating Free" button linking to `/auth`
   - Secondary info: contact email (e.g., hello@vovv.ai) for questions
   - Trust signals: "Free to try", "No credit card required", "Cancel anytime"

### Files to Create/Modify

**New file: `src/pages/Team.tsx`**
- Uses `PageLayout` wrapper (consistent nav + footer)
- Imports `TEAM_MEMBERS` from `@/data/teamData`
- Three sections: Hero, Team Grid, Bottom CTA with contact email

**Modified file: `src/App.tsx`**
- Add route: `<Route path="/team" element={<Team />} />`
- Import the new `Team` page component

**Modified file: `src/components/landing/LandingFooter.tsx`**
- Add "Team" link (`/team`) to the Company section of the footer

### Technical Details

- Videos use `preload="none"` + `poster` attribute for lazy loading (per project memory)
- Page uses `PageLayout` which includes `LandingNav` and `LandingFooter` and handles scroll-to-top
- Cards use `rounded-2xl`, `border-border`, `shadow-sm` styling consistent with existing landing sections
- Contact email displayed as a `mailto:` link
- Spacious padding: `py-24 sm:py-32` for hero, `py-20` for grid, `py-20` for CTA
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 lg:gap-10`

