
## Rename Workflow Cards with Better Display Names

The workflow cards currently show database names directly. We'll add a display name map in `Workflows.tsx` to pass polished names to each `WorkflowCardCompact` via its existing `displayName` prop.

### Proposed Name Changes

| Current (DB) | New Display Name |
|---|---|
| Selfie / UGC | Selfie / UGC Visuals |
| Picture Perspectives | Picture Perspectives Generator |
| Image Upscaling | Image Upscaling Tool |
| Interior / Exterior Staging | Interior Staging Visuals |
| Mirror Selfie | Mirror Selfie Visuals |
| Flat Lay | Flatlay Visuals |
| Virtual Try-On | *(hidden, filtered out)* |
| Product Listing | *(hidden, filtered out)* |
| Catalog Studio | *(keep as-is or rename?)* |

### Changes

**`src/pages/Workflows.tsx`**
- Add a `DISPLAY_NAMES` map keyed by workflow slug
- Pass the override as `displayName` prop to each `WorkflowCardCompact`

This is a code-only change — no database migration needed. The `WorkflowCardCompact` component already accepts a `displayName` prop.
