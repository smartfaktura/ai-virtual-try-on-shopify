

## Plan: Admin Chat Sessions Panel

### Problem
Chat sessions store `user_id` (UUID) but you can't see which user (email) sent the messages. Need an admin page to browse chat sessions with user info, pagination, and filtering.

### Changes

**1. New page: `src/pages/AdminChatSessions.tsx`**
- Admin-only page at `/app/admin/chat-sessions`
- Fetches `chat_sessions` joined with user emails via the existing `get_user_emails_for_admin` DB function (already exists, takes UUID array, returns emails — admin-only via `has_role`)
- Two-step fetch: get paginated chat sessions, then resolve user emails in batch
- Features:
  - **Paginated table** (20 per page) sorted by `updated_at DESC`
  - **Search filter** by email (client-side filter on loaded batch, or fetch profiles matching email then filter)
  - **Each row shows**: user email, message count, last message preview, page URL, created/updated dates
  - **Expandable row** or click-to-open modal showing full message thread in chat-bubble style
  - **Delete button** per session (admins already have DELETE RLS)
- Uses existing RLS: "Admins can view all sessions" + "Admins can delete sessions"

**2. Register route in `src/App.tsx`**
- Add lazy import for `AdminChatSessions`
- Add route: `/admin/chat-sessions`

**3. Add nav link in `src/components/app/AppShell.tsx`**
- Add "Chat Sessions" link in admin-only section (similar to how AdminScenes is accessed)

### Data flow
```text
chat_sessions (paginated, ordered by updated_at DESC)
  → collect user_ids
  → get_user_emails_for_admin(user_ids[])
  → merge email into each session row
  → render table
```

### No database changes needed
- `chat_sessions` table already has admin SELECT/DELETE RLS
- `get_user_emails_for_admin` function already exists and is admin-gated

