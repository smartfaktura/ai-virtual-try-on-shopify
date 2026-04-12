

# Rename to "Presets" Everywhere

## Rationale
"Explore Presets" is two words where one suffices. "Share to Explore Presets" is clunky. A single word — **Presets** — is clean, scannable, and works in all contexts (nav label, modal title, tooltip, toast).

## Changes

### 1. Sidebar nav label
**`src/components/app/AppShell.tsx`** — change `'Explore Presets'` → `'Presets'`

### 2. Page header
**`src/pages/Discover.tsx`** — change PageHeader title `"Explore Presets"` → `"Presets"`

### 3. Modal title + footer
**`src/components/app/SubmitToDiscoverModal.tsx`**
- Title: `"Share to Discover"` → `"Share to Presets"`
- Footer: `"…before appearing in Discover"` → `"…before appearing in Presets"`

### 4. Library share section
**`src/components/app/LibraryDetailModal.tsx`** — heading `"Share to Discover"` → `"Share to Presets"`

### 5. Freestyle tooltip
**`src/components/app/freestyle/FreestyleGallery.tsx`** — tooltip `"Share to Discover"` → `"Share to Presets"`

### 6. Toast message
**`src/hooks/useDiscoverSubmissions.ts`** — `"…in Discover once approved"` → `"…in Presets once approved"`

### 7. Studio chat prompt
**`src/components/app/StudioChat.tsx`** — `"Submit to Discover"` → `"Submit to Presets"`

Only user-facing strings change. No variable/function/file renames.

