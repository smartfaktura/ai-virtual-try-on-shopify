

## Move Room Details to Upload Step + Add Credits

### 1. Move Room Details into the Upload Step

Currently, Room Type, Wall Color, and Flooring selectors appear in the `settings` step (Style selection step). They should be part of the `upload` step, right below the photo upload card, so the user fills in all room info before moving to style selection.

**File: `src/pages/Generate.tsx`**

- **Remove** the Room Details card from the settings step (lines ~2197-2249) -- the entire `{isInteriorDesign && (<Card>...Room Details...</Card>)}` block.
- **Add** the same Room Details card into the upload step (after the `UploadSourceCard` around line 1096), shown only when `isInteriorDesign && scratchUpload` (i.e., after a photo is uploaded/selected). This keeps upload + room details together as one logical step.

### 2. Add 100 Credits to 123presets Account

The account has user_id `68c931a0-454d-4ce3-806c-c0665d1541bd` with current balance of 10 credits. Will run a database migration to add 100 credits (new balance: 110).

**Database migration:**
```sql
UPDATE profiles
SET credits_balance = credits_balance + 100
WHERE user_id = '68c931a0-454d-4ce3-806c-c0665d1541bd';
```

