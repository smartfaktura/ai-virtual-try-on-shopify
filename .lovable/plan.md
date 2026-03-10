

## Delete Test Account: `123case@123presets.com`

### What exists
- **1 profile row** for user `c1b8d2b1-3b6d-4dad-9593-59f5222c3311` — no other data in any table
- `tomassimkus@123presets.com` does not exist in the database at all

### Plan

1. **Delete the profile row** from `profiles` table for user ID `c1b8d2b1-3b6d-4dad-9593-59f5222c3311`
2. **Delete the auth user** from `auth.users` via a migration (since `handle_new_user` trigger references `auth.users`, and the profile has `ON DELETE CASCADE` indirectly — but we need a migration to touch auth schema safely)

Since we cannot modify the `auth` schema via migrations, the profile delete is straightforward. The auth user record will need to be deleted via a SQL command using `DELETE FROM auth.users WHERE id = 'c1b8d2b1-...'` — this is a data operation.

### Steps
1. Delete profile: `DELETE FROM profiles WHERE user_id = 'c1b8d2b1-3b6d-4dad-9593-59f5222c3311'`
2. Delete auth user: `DELETE FROM auth.users WHERE id = 'c1b8d2b1-3b6d-4dad-9593-59f5222c3311'`

This will fully remove the account so you can re-test signup with that email.

