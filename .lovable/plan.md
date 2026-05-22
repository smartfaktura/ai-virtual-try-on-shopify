# Mark Short Film as Coming Soon

The Short Film card on `/app/video` currently shows the `BETA` badge and links to `/app/video/short-film`. Since the flow is bugging, switch it to a disabled `Coming Soon` state, matching the Ad Sequence and Consistent Model cards.

## Change

In `src/pages/VideoHub.tsx`, on the Short Film `VideoWorkflowCard`:

- Remove `beta`
- Add `disabled`
- Add `comingSoon`

Keep title, description, icon, bestFor tags, and `to` route unchanged. No other files touched.
