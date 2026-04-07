

# Fix "Edit Account" for Trend Watch

## Problem
The "Edit Account" menu item does nothing — the `onEdit` handler is `() => {}`. The `AddAccountModal` also has no edit mode, so there's no way to change a category or other fields after adding an account.

## Changes

### 1. Update `AddAccountModal` to support edit mode
- Add optional `editingAccount` prop with existing account data
- When provided, pre-fill all fields (display name, username, category, source mode, profile URL)
- Change dialog title to "Edit Account" and button text to "Save Changes"
- Add an `onUpdate` callback prop that receives `{ id, ...fields }` and calls a Supabase update on `watch_accounts`

### 2. Wire up edit flow in `AdminTrendWatch.tsx`
- Add `editingAccount` state (`useState<any>(null)`)
- When `onEdit(account)` is called, set `editingAccount` to that account and open the modal
- Pass `editingAccount` to `AddAccountModal`
- Add an `updateAccount` mutation that does `supabase.from('watch_accounts').update({...}).eq('id', id)` and invalidates queries
- When the modal closes, clear `editingAccount`

## Files to modify
- `src/components/app/trend-watch/AddAccountModal.tsx` — add edit mode with pre-filled fields
- `src/pages/AdminTrendWatch.tsx` — wire `onEdit`, add update mutation, pass editing state to modal

