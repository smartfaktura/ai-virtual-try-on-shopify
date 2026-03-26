

# Upgrade All Toasts to VOVV.AI Branded Toasts

## Approach
Instead of editing 58+ files individually, create a **drop-in branded toast wrapper** that intercepts all `toast.success()`, `toast.error()`, `toast.info()` calls and automatically adds VOVV.AI team avatars + improved messaging. Then swap the import source in `App.tsx`.

## Changes

### 1. Upgrade `src/lib/brandedToast.tsx` — Create a full branded toast proxy

Replace the current file with a comprehensive branded toast system:

- Create a `vovvToast` proxy object that mirrors the sonner `toast` API (`success`, `error`, `info`, `warning`, plus default call signature)
- Each toast type gets a **context-appropriate team member avatar** automatically:
  - `success` → Sophia (photographer, positive confirmations)
  - `error` → Luna (troubleshooter, fixing issues)
  - `info` → Kenji (art director, informational guidance)
  - `warning` → Sienna (brand guardian, caution)
- Avatar rendered as a `w-6 h-6 rounded-full` icon prepended to every toast
- Pass through all sonner options (duration, description, action, etc.)
- Keep existing named helpers (`toastSophia`, etc.) for backward compatibility
- Export the proxy as both `vovvToast` and as default `toast` for easy migration

### 2. Update `src/App.tsx` — Restyle the Sonner Toaster

Update the `<Toaster>` component with VOVV.AI branded styling:
- Custom `toastOptions.classNames` with warm stone background, premium shadow, no harsh borders
- Slightly larger padding for the avatar + text layout
- Use brand CSS variables for colors

### 3. Bulk-replace toast imports across all 58 source files

Replace `import { toast } from 'sonner'` with `import { toast } from '@/lib/brandedToast'` in every file under `src/`. This makes every existing `toast.success(...)` / `toast.error(...)` call automatically branded without changing any call sites.

Files affected (all under `src/`): ~58 files that currently import from `'sonner'`.

### 4. Improve key toast messages

While swapping imports, update the most user-facing toast messages to be shorter and more engaging:

| Current | New |
|---------|-----|
| `'Please sign in to generate images'` | `'Sign in to start generating'` |
| `'Authentication required'` | `'Please sign in first'` |
| `'Generation cancelled. Credits refunded.'` | `'Cancelled — credits returned ✨'` |
| `'Settings copied to editor'` | `'Settings loaded!'` |
| `'Link copied'` | `'Link copied!'` |
| `'Insufficient credits. Need X, have Y.'` | `'Not enough credits for this one'` |
| `'Failed to send feedback'` | `'Couldn't send — try again?'` |
| `'Password updated successfully!'` | `'Password updated!'` |
| `'Please fill in all fields'` | `'Fill in all fields to continue'` |
| `'Message sent!'` | `'Message sent!'` (keep) |
| `'Please select a product first'` | `'Pick a product first'` |
| `'Please upload an image first'` | `'Upload an image to get started'` |

Only update the ~20 most common user-facing messages. Leave admin/debug toasts as-is.

## Technical Details

- **Core change**: `brandedToast.tsx` becomes the single toast API for the entire app
- **No new dependencies** — uses existing sonner, teamData
- **Backward compatible** — same `toast.success()` / `toast.error()` API
- **Files created**: None
- **Files modified**: `src/lib/brandedToast.tsx`, `src/App.tsx`, ~58 files (import swap only), ~20 files (message text updates)

