

# Button Audit Results

After systematically examining the entire app codebase — all pages, modals, navigation, landing sections, and interactive components — here are my findings:

## Properly Intentional "Coming Soon" / Disabled Buttons (NOT bugs)

These are deliberately disabled or show a "coming soon" toast. They're working as designed:

1. **Video nav item** in sidebar (`AppShell.tsx`) — shows "Coming soon!" toast for non-admin users
2. **Generate Video button** in `LibraryDetailModal.tsx` — `disabled` with "Coming Soon" label
3. **Generate Video button** in `WorkflowPreviewModal.tsx` — `disabled` with "Soon" label
4. **Video page** (`VideoGenerate.tsx`) — shows "Coming Soon" badge for non-admins
5. **Download Brand Kit** button on Press page — shows toast "Brand kit download coming soon"

## Actual Issues Found

### 1. `JobDetailModal.tsx` — noop download handler
**Line 163:** `onDownload={() => {}}` — the lightbox download button does nothing when opened from the job detail modal. The download callback is an empty function.

### 2. `JobDetailModal.tsx` — lightbox never opens
The modal has `lightboxOpen` state and `lightboxIndex` state, but **nothing ever calls `setLightboxOpen(true)`**. The lightbox is wired up but unreachable — users can't open images full-screen from the job detail view.

### 3. No other broken buttons found
All other buttons across the app (landing CTAs, navigation, pricing, settings, feedback, contact forms, onboarding, product upload, freestyle, workflows, creative drops, discover, etc.) have proper `onClick` handlers that either navigate, call APIs, or trigger modals correctly.

---

## Recommended Fixes

### Fix 1: Wire up lightbox opening in `JobDetailModal.tsx`
Add an `onDoubleClick` or secondary action (e.g., expand icon) on result images to open the lightbox at that index.

### Fix 2: Implement proper download in `JobDetailModal.tsx`
Replace `onDownload={() => {}}` with an actual download function (fetch blob → create anchor → trigger download), matching the pattern used in `LibraryDetailModal` and `Freestyle`.

### Fix 3: (Optional) Press page — "Download Brand Kit"
Either create an actual brand kit ZIP for download, or change the button to link to a contact/email flow instead of just showing a toast.

---

## Summary
The app is in good shape — only **2 real broken interactions** were found, both in `JobDetailModal.tsx` (dead lightbox + noop download). Everything else is either working correctly or intentionally disabled with appropriate user feedback.

