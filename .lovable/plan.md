

## Plan: Create dedicated Admin Feedback page at `/app/admin/feedback`

### Approach
Mirror the existing `AdminChatSessions` page pattern — a standalone admin-only page with table layout, pagination, filters, and delete capability. Reuse the logic already in `AdminFeedbackPanel` but present it in the full-page table format matching chat sessions.

### Changes

#### 1. Create `src/pages/AdminFeedback.tsx`
New page mirroring `AdminChatSessions` structure:
- Admin guard with `useIsAdmin()`
- `PageHeader` with title "User Feedback" and subtitle
- Status filter chips (All / New / Reviewed / Planned / Done) and Type filter chips (All / Bug / Feature / General)
- Table with columns: User (email), Type (badge), Message (truncated), Page, Status (dropdown to change inline), Date
- Pagination (20 per page)
- Click row → Dialog showing full message + admin notes editor + delete button
- Delete mutation
- Email resolution via `get_user_emails_for_admin` RPC (same pattern as chat sessions)

#### 2. Add route in `src/App.tsx`
Add `<Route path="/admin/feedback" element={<AdminFeedback />} />` next to the existing admin routes.

#### 3. Add nav link in `src/components/app/AppShell.tsx`
Add a "Feedback" menu item in the admin dropdown (next to "Chat Sessions"), navigating to `/app/admin/feedback`.

#### 4. No database changes needed
The `feedback` table already has admin RLS policies for full CRUD.

