

## Fix: Update Customer Portal Return URL

Since we removed tabs from the Settings page, the return URL in the customer portal function should be cleaned up.

### Change — 1 file

**`supabase/functions/customer-portal/index.ts`** (line 53)

Update the return URL from:
```
return_url: `${origin}/app/settings?tab=plans`
```
to:
```
return_url: `${origin}/app/settings`
```

This is a minor cleanup — the page loads fine either way, but removes the now-unused query parameter.

