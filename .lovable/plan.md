

## Fix Broken Email CTA Links

**Problem**: Email CTA buttons link to `https://vovv.ai/dashboard`, but the app has no `/dashboard` route. The dashboard lives at `/app`. Users clicking these links hit the 404 page.

**Affected CTAs** in `supabase/functions/send-email/index.ts`:
- **Welcome email** (line 101): `"https://vovv.ai/dashboard"` → links to "Start Creating"
- **Generation complete email** (line 132): `"https://vovv.ai/dashboard"` → links to "View Results"
- **Generation failed email** (line 222): `"https://vovv.ai/dashboard"` → links to "Try Again"
- **Low credits email** (line 150): `"https://vovv.ai/pricing"` → this one is fine, `/pricing` exists

### Fix

Update three URLs in `send-email/index.ts`:

| Line | Current | Fixed |
|------|---------|-------|
| 101 | `https://vovv.ai/dashboard` | `https://vovv.ai/app` |
| 132 | `https://vovv.ai/dashboard` | `https://vovv.ai/app/library` |
| 222 | `https://vovv.ai/dashboard` | `https://vovv.ai/app` |

- **Welcome**: → `/app` (dashboard)
- **Generation complete**: → `/app/library` (where results live, more useful than dashboard)
- **Generation failed**: → `/app` (dashboard to retry)

Single file change, no other files affected.

