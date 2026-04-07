

# Fix "Add Image → Draft Scene" Insert Error

## Problem
The `AddImageDraftModal` tries to insert into `watch_posts` with a `source` column that doesn't exist, and without a `watch_account_id` which is required (`NOT NULL`). This causes the error: *"Could not find the 'source' column of 'watch_posts'"*.

## Solution
Two changes needed:

### 1. Database migration — make `watch_account_id` nullable + add `source` column
- `ALTER TABLE watch_posts ALTER COLUMN watch_account_id DROP NOT NULL;`
- `ALTER TABLE watch_posts ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'instagram';`

This allows manual uploads (no linked account) and tracks where the post came from.

### 2. Code fix in `AddImageDraftModal.tsx`
No code changes needed — the insert already sends `source: 'manual_upload'` and omits `watch_account_id`, which will work once the schema is fixed.

### Files
- **Migration**: Add `source` column, make `watch_account_id` nullable
- No application code changes required

