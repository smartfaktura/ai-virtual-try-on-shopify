Add a secondary Close button beneath the "Use this scene" CTA in the Fresh Scenes preview modal.

## Change — `src/components/app/DashboardFreshScenes.tsx`

In `FreshScenePreviewModal`, inside the CTA wrapper that currently holds only the primary `Button`, add a second `Button` directly after it:

- `variant="outline"`, `onClick={onClose}`
- Same sizing as the primary: `w-full h-11 text-base`
- Label: `Close`

Wrap the two buttons in a `flex flex-col gap-2` container so they stack with consistent spacing. The top-right `X` icon remains for parity with Discover/Library modals.

No other changes.
