

## Simplify Settings Page

Remove the tab structure and consolidate into a single scrollable page. Remove Brand Defaults and Default Image Settings cards. Show the plan/credits section inline on the main page instead of in a separate tab.

### Changes — 1 file

**`src/pages/Settings.tsx`**

1. **Remove the `<Tabs>` wrapper** and all `<TabsList>`, `<TabsTrigger>`, `<TabsContent>` elements
2. **Remove the "Brand Defaults" card** (lines 187-234)
3. **Remove the "Default Image Settings" card** (lines 236-270)
4. **Restructure as a single scrollable page** with this order:
   - Current Plan + credits progress (from Plans tab)
   - Choose Your Plan + billing toggle + plan cards (from Plans tab)
   - Enterprise banner
   - Credit packs
   - Cancel/reactivate link
   - Notifications card (from General tab)
   - Download & Export, AI Model Settings, Team & Permissions, Help & Support, About (from Account tab)
   - Save Settings button
5. **Remove unused imports**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, and `BrandTone`/`BackgroundStyle` type imports
6. **Remove unused settings fields** from `UserSettings` interface and `DEFAULT_SETTINGS`: `brandTone`, `backgroundStyle`, `negatives`, `consistencyEnabled`, `defaultAspectRatio`, `defaultImageCount`

This gives a cleaner single-page layout where the plan is immediately visible without clicking a separate tab.

