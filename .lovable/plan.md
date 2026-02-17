

## Branded Discover Loading State with Team Avatars

### Problem
The Discover page loading state is a plain spinning icon -- minimal and forgettable. It doesn't reinforce the VOVV.AI brand or the Studio Team concept.

### Solution
Replace the generic spinner with an immersive, branded loading experience featuring the Studio Team avatars and rotating status messages -- matching the generation loading pattern already used elsewhere in the app.

### Design

The loading state will show:
1. A row of 5 randomly-selected team member avatars in small circles, with a subtle staggered fade-in animation
2. A rotating status message from the currently "active" team member (e.g., "Sophia is curating your feed...")
3. A subtle shimmer bar underneath to indicate progress
4. The whole block is centered vertically and horizontally in the content area

### Changes

**File: `src/pages/Discover.tsx`**

1. Import `TEAM_MEMBERS` from `@/data/teamData`
2. Add a `useMemo` to pick 5 random team members (stable per mount)
3. Add a `useState` + `useEffect` to cycle through the 5 members every 2.5 seconds, showing their status message
4. Replace the current loading block (lines 359-362) with the new branded loading component:

```
Before:
  <Loader2 spinning icon>

After:
  <div centered>
    <row of 5 circular avatars, active one highlighted with ring>
    <"Sophia is curating your feed..." rotating text>
    <shimmer progress bar>
  </div>
```

The avatar images are already optimized and hosted. Status messages come from `teamData.ts` (e.g., "Setting up the lighting...") -- we'll adapt them to discovery context like "[Name] is curating your feed...".

### Files Modified
- `src/pages/Discover.tsx` -- replace loading spinner with branded team avatar loading state

