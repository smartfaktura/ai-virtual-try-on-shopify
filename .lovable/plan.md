

## Replace MissingRequestBanner with FeedbackBanner on Workflows Page

The Workflows page currently uses `<MissingRequestBanner category="workflow" compact />` at the bottom of the workflow catalog, which shows an inline "Missing a feature or workflow?" text. Every other app page (Dashboard, Generate, Products, Settings, Jobs, Creative Drops) uses the `<FeedbackBanner />` component instead — the "Help us improve VOVV.AI" bar with a "Share feedback" popover button.

### Change

**`src/pages/Workflows.tsx`**
1. Replace the `MissingRequestBanner` import with `FeedbackBanner` import
2. Replace `<MissingRequestBanner category="workflow" compact />` (line ~239) with `<FeedbackBanner />`
3. Remove the now-unused `MissingRequestBanner` import

This gives the Workflows page the same feedback UI as all other pages — a branded bar with Bug / Feature Request / General type chips in a popover.

