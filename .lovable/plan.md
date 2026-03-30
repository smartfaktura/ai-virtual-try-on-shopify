

## Pre-select "Pro" Quality in Freestyle Generator

Change the default quality from `'standard'` to `'high'` (which maps to "Pro" in the UI) so users get better generations by default. They can still switch back to Standard manually.

### Changes

**1. `src/pages/Freestyle.tsx` (line 93)**
- Change `useState<'standard' | 'high'>('standard')` → `useState<'standard' | 'high'>('high')`
- The existing auto-upgrade `useEffect` (lines 96-100) becomes redundant but harmless — can be kept or removed

**2. `src/pages/PublicFreestyle.tsx` (line 88)**
- Same change: default quality from `'standard'` to `'high'`
- Also update the reset function (line 108) to reset to `'high'` instead of `'standard'`

