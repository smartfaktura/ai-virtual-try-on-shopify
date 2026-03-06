

## Enhance Admin Feedback Panel in Settings

The `AdminFeedbackPanel` already exists in Settings and renders for admins. It shows feedback items with status filtering and status updates. I'll enhance it to be more comprehensive and useful for reviewing all requests including model/scene/workflow requests from the `MissingRequestBanner`.

### Enhancements

**`src/components/app/AdminFeedbackPanel.tsx`**:

1. **Type filter chips** — Add a second row of filter chips for type (`bug`, `feature`, `general`) so admins can quickly find feature requests vs bugs
2. **Request tag parsing** — Parse `[model-request]`, `[scene-request]`, `[workflow-request]` prefixes from messages and show them as colored badges, making content requests easy to spot
3. **Admin notes** — Add an inline editable notes field per item (uses existing `admin_notes` column in the feedback table) so admins can jot down internal context
4. **Better layout** — Show user email (join or display user_id), increase max height, add item count in header
5. **Collapsible section** — Wrap in a collapsible so it doesn't take too much space when not needed

### Files

| File | Change |
|------|--------|
| `src/components/app/AdminFeedbackPanel.tsx` | Add type filtering, request tag badges, inline admin notes editing, improved layout |

No database or migration changes needed — `admin_notes` column already exists on the `feedback` table.

