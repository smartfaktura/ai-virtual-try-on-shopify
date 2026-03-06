

## Inline Feedback Banner — Simple, Non-Floating

Instead of a floating widget, add a small inline feedback banner section on key pages. It follows the same pattern as `LowCreditsBanner` — a dismissible inline card that sits naturally in the page flow.

### Where it goes
- **Dashboard** — below the onboarding checklist / metrics area
- **Settings** — bottom of the page

### What it looks like
A subtle branded card (matching the existing `LowCreditsBanner` style — `rounded-xl`, `border`, muted background):
- `MessageSquarePlus` icon + "Help us improve VOVV.AI" title
- Short subtitle: "Share a bug report, feature request, or general feedback"
- 3 small type chips (Bug / Feature / General) — clicking one opens a simple inline textarea + submit
- Dismissible per session (localStorage)
- After submit: success state with "Thanks! We read every submission." then auto-collapse

### Database
- New `feedback` table: `id`, `user_id`, `type` (bug/feature/general), `message`, `page_url`, `status` (new/reviewed/planned/done), `admin_notes`, `created_at`
- RLS: users insert + read own; admins read + update all

### Admin view
- New section on Settings page (admin-only): simple table of feedback entries with status filter tabs and inline status dropdown to update

### Files

| Action | File |
|--------|------|
| New | `src/components/app/FeedbackBanner.tsx` — inline collapsible feedback card |
| New | `src/components/app/AdminFeedbackPanel.tsx` — admin table in Settings |
| Edit | `src/pages/Dashboard.tsx` — add `<FeedbackBanner />` |
| Edit | `src/pages/Settings.tsx` — add `<FeedbackBanner />` + admin panel |
| Migration | Create `feedback` table with RLS |

