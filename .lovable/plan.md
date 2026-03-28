

# Scratch-Uploads Bucket Security — Plan Review

## What exists today (the problem)

The `scratch-uploads` storage bucket has **3 permission rules** that currently allow **anyone on the internet** (no login required) to:

1. **Upload** any file up to 10MB
2. **View/download** any file
3. **Delete** any file

This means a random person could upload spam files, waste your storage, or delete images that your app is using.

## What the plan changes

### Rule 1 — "Anyone can upload scratch images" → **DELETED & REPLACED**
- **Old**: Anyone (even not logged in) can upload files
- **New**: Only logged-in users can upload files
- **Impact on your app**: The `AddModelModal` component (where users upload model reference photos) requires login already, so this works fine. The two backend functions (`generate-user-model` and `try-website-shot`) use a special admin-level connection that **bypasses all permission rules entirely** — they are completely unaffected.

### Rule 2 — "Anyone can view scratch images" → **STAYS UNCHANGED**
- Public read access remains because generated model images and try-shot results are displayed using public URLs from this bucket. Removing this would break image display across the app.

### Rule 3 — "Anyone can delete scratch images" → **DELETED & REPLACED**
- **Old**: Anyone can delete any file
- **New**: Only logged-in users can delete files
- **Impact**: Prevents anonymous deletion of files. No part of your app currently deletes from this bucket via the client, so nothing breaks.

## What does NOT change
- The bucket itself stays public (readable)
- Backend functions (`generate-user-model`, `try-website-shot`) keep working — they use admin-level access that ignores these rules
- No app code changes needed — only a database migration with 4 SQL statements

## Is it a good plan?

**Yes, it's solid for the reported issue.** It blocks the main attack vector (anonymous uploads/deletes) without breaking anything. The one limitation is that any logged-in user could still upload to any path (not just their own folder), but the current upload patterns (`models/UUID.png`, `try-shots/UUID.png`) don't use user-scoped folders, so adding path restrictions would require refactoring upload code — not worth it for a "warn" level finding.

