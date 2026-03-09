

## Fix Landing Page CTA Links for Logged-In Users

Update all landing page CTAs so logged-in users go to the relevant app page instead of `/auth`.

### Changes

Each file: add `import { useAuth } from '@/contexts/AuthContext'`, get `const { user } = useAuth()`, then update `navigate()`.

| File | Button | Logged-out → | Logged-in → |
|------|--------|-------------|-------------|
| `HeroSection.tsx` (line 208) | "Create My First Visual Set" | `/auth` | `/app/workflows` |
| `FreestyleShowcaseSection.tsx` (line 258) | "Try Freestyle Free" | `/auth` | `/app/freestyle` |
| `StudioTeamSection.tsx` (line 179) | "Meet Your Team" | `/auth` | `/team` |
| `FinalCTA.tsx` (line 31) | "Get Started Free" | `/auth` | `/app` |
| `HowItWorks.tsx` (line 344) | "Try It Free" | `/auth` | `/app` |
| `CreativeDropsSection.tsx` (line 84) | "Set Up Monthly Creative Drops" | `/auth` | `/app/creative-drops` |
| `LandingPricing.tsx` (line 101) | Plan CTAs | `/auth` | `/app` |

`LandingNav.tsx` already handles this correctly — no change needed.

