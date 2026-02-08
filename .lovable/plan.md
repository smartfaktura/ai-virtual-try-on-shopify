

## Settings Page Optimization

### Problems Identified

1. **Enterprise plan card squeezed into the 4-column plan grid** -- Same issue you fixed on the landing page, but Settings still shows all 5 plans in a row. Enterprise needs to be pulled out into a separate banner below.

2. **Competitor Comparison section doesn't belong here** -- This is a sales/marketing component that fits the landing page, not a settings page where the user already has an account. It adds clutter.

3. **No section navigation** -- The page is a single long scroll with 8+ card sections. Users have to scroll extensively to find what they need.

4. **Team & Permissions is nearly empty** -- Only contains one checkbox ("Restrict prompt editing to admins only"). Too thin to justify its own section.

5. **Help & Support has placeholder URLs** -- Links point to `docs.example.com` and `support@example.com` which are clearly placeholders.

6. **About section is static/hardcoded** -- Version and "last updated" are hard-coded strings. "What's New" button shows a "coming soon" toast.

7. **Settings don't persist** -- All values are local React state. The "Save Settings" button just shows a toast but saves nothing to the database.

### What Changes

**Reorganize into tabbed layout** with 3 clean tabs:
- **General** -- Brand defaults, image settings, notifications (core daily-use settings)
- **Plans & Credits** -- Current plan, plan selection (with Enterprise separated), credit packs
- **Account** -- Download/export, AI model, team permissions, help, about (consolidated)

**Remove:**
- Competitor Comparison (belongs on landing page only)

**Fix:**
- Enterprise plan pulled out of the grid into a banner (matching landing page)
- Help links updated to brandframe.ai URLs
- Team & Permissions merged into Account tab (not its own section)
- About section simplified and merged into Account tab

**Persist settings to database:**
- Save brand defaults, notification preferences, image settings, and export preferences to the `profiles` table via a new JSONB `settings` column

### Technical Details

**1. Database migration: Add `settings` JSONB column to `profiles`**

```text
ALTER TABLE profiles ADD COLUMN settings JSONB DEFAULT '{}';
```

This stores all user preferences (brand defaults, notification prefs, image defaults, export config) in a single flexible column.

**2. Rewrite `src/pages/Settings.tsx`**

- Add a `Tabs` component (from shadcn/ui) with 3 tabs: General, Plans and Credits, Account
- Load settings from `profiles.settings` on mount
- Save settings to `profiles.settings` on "Save" click
- Move Enterprise plan out of the grid into a separate full-width banner (same pattern as landing page)
- Remove `CompetitorComparison` import and usage
- Consolidate Team + Help + About into the Account tab

**3. No changes to existing components**

`PlanCard`, `CreditPackCard`, and `CreditIndicator` remain as-is. The only change is how they are arranged on the Settings page.

### Tab Structure

```text
[General]  [Plans & Credits]  [Account]

-- General Tab --
+----------------------------------+
| Brand Defaults                   |
| (tone, background, negatives)    |
+----------------------------------+
| Default Image Settings           |
| (aspect ratio, count)            |
+----------------------------------+
| Notifications                    |
| (email + in-app toggles)         |
+----------------------------------+

-- Plans & Credits Tab --
+----------------------------------+
| Current Plan card (with progress)|
+----------------------------------+
| Choose Your Plan (monthly/annual)|
| [Free] [Starter] [Growth] [Pro] |
+----------------------------------+
| Enterprise banner (full-width)   |
| "Need custom volume?" [Contact]  |
+----------------------------------+
| Need More Credits? (packs)       |
+----------------------------------+

-- Account Tab --
+----------------------------------+
| Download & Export Defaults        |
+----------------------------------+
| AI Model Settings                |
+----------------------------------+
| Team & Permissions               |
+----------------------------------+
| Help & Support                   |
+----------------------------------+
| About (version inline)           |
+----------------------------------+
```

### Files Changed

| File | Action | Description |
|---|---|---|
| Database migration | New | Add `settings JSONB DEFAULT '{}'` to `profiles` |
| `src/pages/Settings.tsx` | Rewrite | Tabbed layout, persistent settings, Enterprise separated, Competitor Comparison removed |

### What Gets Removed

- `CompetitorComparison` import/usage from Settings (component file stays since landing page may use it)
- Enterprise plan from the plan card grid (moved to standalone banner)

### What Gets Fixed

- Settings now persist to database (load on mount, save on click)
- Help links point to `brandframe.ai` instead of `example.com`
- Enterprise plan displayed as a separate full-width banner with "Contact Sales" CTA
- Page is navigable via tabs instead of endless scrolling

