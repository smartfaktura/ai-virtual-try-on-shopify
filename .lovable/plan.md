

## Add Team Avatars: Sidebar, Onboarding & Toasts

Three targeted additions to weave the AI team personality throughout the app.

---

### 1. Sidebar "Working" Avatar

Add a small rotating team member widget between the Credits section and User Profile in `AppShell.tsx`. Shows a random team member's avatar + their `statusMessage`, cycling every 8 seconds with a fade transition.

- When sidebar is **expanded**: avatar (24px) + name + status text in a single row
- When sidebar is **collapsed**: just the avatar with a tooltip
- Wrap in `TeamAvatarHoverCard` so hovering shows the video card

**File:** `src/components/app/AppShell.tsx`
- Import `TEAM_MEMBERS` from `@/data/teamData` and `TeamAvatarHoverCard`
- Add a `SidebarTeamAvatar` sub-component with `useState` + `useEffect` for rotation
- Insert between the credits `div` (line ~212) and the user profile `div` (line ~215)

---

### 2. Onboarding Checklist Avatars

Map each onboarding step to a relevant team member and replace the generic product preview thumbnails with team member avatars.

**File:** `src/components/app/OnboardingChecklist.tsx`
- Import `TEAM_MEMBERS` and `TeamAvatarHoverCard`
- Add `teamMember` field to each step:
  - "Upload product" → Sophia (Product Photographer)
  - "Brand profile" → Sienna (Brand Consistency Manager)  
  - "Generate" → Kenji (Campaign Art Director)
- Replace the preview `<img>` with the team member's avatar wrapped in `TeamAvatarHoverCard`
- Add the member's name + role as a subtle label below the step description

---

### 3. Branded Toast Helper

Create a `brandedToast` wrapper function that prepends a small team avatar to sonner toast messages for key actions.

**New file:** `src/lib/brandedToast.tsx`
- Export `brandedToast(member, options)` that calls sonner's `toast()` with a custom JSX description including the member's avatar
- Export convenience functions mapped to specific members:
  - `toastSophia(msg)` — product uploads
  - `toastLuna(msg)` — retouching/generation complete
  - `toastSienna(msg)` — brand profile saved
  - `toastKenji(msg)` — workflow/campaign actions

**Updated files** (swap `toast()` → `brandedToast()` in key spots):
- `src/hooks/useGenerationQueue.ts` — generation complete → Luna
- `src/components/app/ManualProductTab.tsx` — product saved → Sophia
- `src/components/app/BrandProfileForm.tsx` — brand saved → Sienna
- `src/pages/BulkGenerate.tsx` — bulk complete → Kenji

Each toast will render as:
```
[Avatar 20px] "Luna polished your images — they're ready!"
```

---

### Summary
- **3 new insertions**, 1 new file, ~5 files with minor toast swaps
- No database changes needed
- All assets already exist in `teamData.ts`

