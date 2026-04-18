

## Add spacing above "Missing a Visual Type" request banner so it doesn't overlap workflow cards

### Issue
Looking at the screenshot, the "Missing a Visual Type for your brand?" banner sits flush against the workflow cards grid above it (Catalog Studio / Freestyle Studio row). There's no top margin separating the banner from the grid — on both desktop and mobile it reads as cramped/overlapping.

My previous edit only touched internal padding + the mobile gap inside the banner. It didn't add any outside spacing between the banner and the grid above.

### Root cause
`WorkflowRequestBanner.tsx` root container has `mb-20 sm:mb-0` (bottom margin only, for the mobile bottom nav). It has no `mt-*`. Whatever places it (likely `Workflows.tsx`) doesn't wrap it with sufficient top spacing either.

### Plan

**`src/components/app/WorkflowRequestBanner.tsx`** — add top margin to the root container so the banner is visually separated from the cards grid above it on every viewport:

- Change root `className` from:
  `rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6 mb-20 sm:mb-0`
- To:
  `rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6 mt-8 sm:mt-12 mb-20 sm:mb-0`

`mt-8` (32px) on mobile and `mt-12` (48px) on desktop matches the vertical rhythm used elsewhere on `/app/workflows` between sections.

### Acceptance
- Clear visible gap between the workflow cards grid and the request banner on mobile (~32px) and desktop (~48px)
- No overlap, no cramped feel
- Internal banner spacing unchanged from previous fix
- Bottom margin (mobile nav clearance) preserved

