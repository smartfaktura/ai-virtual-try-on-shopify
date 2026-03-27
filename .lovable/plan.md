

# Add Branded "Missing Workflow?" Banner to Workflows Page

## What
Replace the generic `FeedbackBanner` at the bottom of the workflows page with a branded VOVV.AI card featuring team avatars and a message inviting users to request missing workflows. Show it in **all layout modes** (rows, 2col, 3col), not just rows.

## Design
A full-width card after all workflow cards with:
- VOVV.AI branding (logo text or styled heading)
- Stacked team member avatars (3-4 from `TEAM_MEMBERS`)
- Headline: "Missing a workflow for your brand?" 
- Subtitle: "Tell us what you need — we'll build it and add it to our lineup."
- Expandable textarea (reusing `MissingRequestBanner` pattern with `category="workflow"`) that submits to the `feedback` table
- Styled with `bg-primary/5 border border-primary/20 rounded-2xl` to match the dashboard aesthetic

## Changes

### 1. Create `src/components/app/WorkflowRequestBanner.tsx`
- New branded component with avatar stack from `TEAM_MEMBERS` (first 4 avatars)
- Uses the same feedback submission logic as `MissingRequestBanner` (insert into `feedback` table)
- Collapsed state: avatars + headline + "Share Request" button
- Expanded state: textarea + submit button
- Responsive: stacks vertically on mobile

### 2. Update `src/pages/Workflows.tsx`
- Replace `<FeedbackBanner />` in rows layout with `<WorkflowRequestBanner />`
- Add `<WorkflowRequestBanner />` after the grid in 2col/3col layouts too (currently missing any CTA there)

