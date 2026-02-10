

## Community Submissions to Discover

### The Concept

Allow users to submit their best Freestyle creations to the Discover feed, with admin moderation to maintain quality. This is the safest, most scalable approach -- it keeps the Discover feed curated while empowering users to contribute.

### Recommended Flow: "Share to Discover" with Admin Approval

```text
User generates image --> Clicks "Share to Discover" --> Fills quick form --> Submission queued
                                                                                  |
Admin sees pending submissions --> Approves/Rejects --> Approved items appear in Discover
```

### Where the "Share" Button Lives

Two natural entry points (both should exist):

1. **Freestyle Gallery** -- on each generated image card, add a small "Share" icon (like an upload/send icon) alongside the existing download/delete actions
2. **Library detail view** -- when viewing an image fullscreen, add a "Submit to Discover" button

### User Submission Form (Minimal, 3 fields)

When a user taps "Share to Discover", a modal appears with:

| Field | Type | Notes |
|-------|------|-------|
| Title | Text input | Required, max 60 chars |
| Category | Dropdown | cinematic, commercial, photography, styling, ads, lifestyle |
| Tags | Tag input | Optional, up to 5 tags |

The prompt and image URL are carried over automatically from the generation metadata. The user does NOT need to re-enter them.

### Database Changes

**New table: `discover_submissions`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Default gen |
| user_id | uuid | References auth.users |
| image_url | text | From freestyle_generations |
| source_generation_id | uuid | FK to freestyle_generations.id |
| title | text | User-provided |
| prompt | text | Auto-filled from generation |
| category | text | User-selected |
| tags | text[] | User-provided |
| aspect_ratio | text | Auto-filled |
| quality | text | Auto-filled |
| status | text | 'pending', 'approved', 'rejected' (default: 'pending') |
| admin_note | text | Optional rejection reason |
| created_at | timestamptz | Default now() |

**RLS policies:**
- Users can INSERT their own submissions (user_id = auth.uid())
- Users can SELECT their own submissions to see status
- Admins (via user_roles) can SELECT all and UPDATE status

**On approval:** An admin action copies the submission into `discover_presets` (the existing table) and marks the submission as 'approved'. This keeps the Discover feed using a single data source.

### Admin Review UI

A new "Submissions" tab or section in the admin view:
- Shows pending submissions in a grid with image preview, title, user info
- Each card has Approve / Reject buttons
- Approve copies to `discover_presets` automatically
- Reject optionally adds a note (shown to the user)

### Frontend Components

| Component | Purpose |
|-----------|---------|
| `SubmitToDiscoverModal.tsx` | The 3-field submission form |
| `useDiscoverSubmissions.ts` | Hook for creating submissions + checking user's submission status |
| `AdminSubmissionsPanel.tsx` | Admin moderation grid (pending/approved/rejected tabs) |

### UX Details

- After submitting, the user sees a toast: "Submitted for review! You'll be notified when approved."
- Users can see their submission status (pending/approved/rejected) in their Library or a "My Submissions" section
- A small badge on the Discover tab (admin-only) shows the count of pending submissions
- Approved items get a subtle "Community" badge in Discover to distinguish from curated presets
- Rate limit: max 3 pending submissions per user to prevent spam

### Files to Create/Modify

| File | Action |
|------|--------|
| Database migration | CREATE TABLE discover_submissions + RLS policies |
| `src/components/app/SubmitToDiscoverModal.tsx` | New -- submission form modal |
| `src/hooks/useDiscoverSubmissions.ts` | New -- submit, fetch user submissions, admin approve/reject |
| `src/components/app/AdminSubmissionsPanel.tsx` | New -- admin moderation UI |
| `src/pages/Freestyle.tsx` | Add "Share to Discover" action on image cards |
| `src/components/app/FreestyleImageCard.tsx` | Add share button to card overlay |
| `src/pages/Discover.tsx` | Show pending count badge for admins, add "Community" badge on approved items |
| `src/components/app/DiscoverCard.tsx` | Optional "Community" indicator |

