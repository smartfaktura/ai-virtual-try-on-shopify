## Add "Brand Scenes" — Coming Soon

Add a new nav item in the sidebar's **Assets** group that links to a dedicated "coming soon" page explaining that brands will soon be able to create their own custom scenes.

### 1. Sidebar nav (`src/components/app/AppShell.tsx`)

Add a new item to the `Assets` group, between **Brand Models** and **Library**:

```ts
{ label: 'Brand Scenes', icon: Mountain, path: '/app/brand-scenes' }
```

- Import `Mountain` from `lucide-react`
- Add prefetch entry in `prefetchMap` for `/app/brand-scenes`

### 2. New page (`src/pages/BrandScenes.tsx`)

A clean, minimalist "coming soon" page following the project's luxury-restraint aesthetic:

- `SEOHead` with `noindex`, title "Brand Scenes — VOVV.AI"
- Page header with title **"Brand Scenes"** and subtitle: *Coming soon — create your own custom scenes for your brand*
- Centered card explaining the feature:
  - Icon (Mountain in primary/10 circle)
  - Heading: "Custom scenes are coming soon"
  - Body: Brands will soon be able to design and save their own signature scenes — backgrounds, environments, and moods that match their visual identity. Generate any product inside scenes built exclusively for your brand.
  - "What to expect" bullets: Design your own scenes from references or prompts · Save and reuse across all products · Share across your team
  - Secondary CTA back to **Visual Studio** (`/app/workflows`) so users have somewhere to go
- Inter font, semantic tokens only, no terminal periods in headers/subtitles per project memory

### 3. Route (`src/App.tsx`)

- Lazy import: `const BrandScenes = lazy(() => import('@/pages/BrandScenes'))`
- Add route inside `/app/*` Routes: `<Route path="/brand-scenes" element={<BrandScenes />} />`

### 4. Studio Chat sync

Per the `studio-chat-knowledge-source` memory, sidebar label changes must be reflected in the studio-chat knowledge. After implementation, add a brief mention of "Brand Scenes (coming soon)" to the studio-chat SYSTEM_PROMPT so the assistant knows about it.

### Out of scope

- No backend work, no DB tables, no actual custom-scene creation UI — purely a placeholder page.
- No changes to the Library or Products pages.
