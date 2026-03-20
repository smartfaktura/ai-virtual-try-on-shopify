
What I found right now
- You do not have a true “Save to Camera Roll / Photos” flow yet.
- Library opened-image modal and Freestyle opened-image modal both use the same component (`LibraryDetailModal`) and currently use browser download (`&lt;a download&gt;`).
- On iOS, that usually means Files/Downloads behavior (or inconsistent behavior), not a direct Photos save action.

Is it possible for iOS users?
- Yes, but not as silent auto-save.
- Web apps cannot write directly to Camera Roll without user action.
- Best pattern is: open native iOS share sheet with the image file, then user taps **Save Image**.

Implementation plan
1. Add a shared mobile image-save helper
- Create a utility in `src/lib/` to:
  - fetch image blob
  - create a File with proper extension
  - use `navigator.canShare({ files })` + `navigator.share(...)` when supported
  - fallback to existing download/open-tab behavior when not supported

2. Update library/freestyle popup action
- File: `src/components/app/LibraryDetailModal.tsx`
- Replace current download handler with the shared helper.
- On mobile, label button as **Save to Photos** (desktop remains **Download Image**).
- Show a small instruction toast on iOS: “In share menu, tap Save Image.”

3. Freestyle gets fixed automatically
- `src/pages/Freestyle.tsx` already opens `LibraryDetailModal`, so this single modal update covers both:
  - mobile library popup
  - freestyle opened-image popup

4. Optional consistency pass (recommended)
- Apply the same helper to other image modals:
  - `src/components/app/WorkflowPreviewModal.tsx`
  - Generate lightbox/download handlers
- This avoids mixed behavior across pages.

5. QA checks
- iPhone Safari: tap Save to Photos → share sheet appears → Save Image available.
- iOS home-screen app mode: same flow works.
- Android Chrome: share/download still works.
- Desktop: normal download remains unchanged.

Technical note
- No backend changes needed.
- iOS limitation is browser security, not your app logic; we can still provide a clean UX via share sheet.
