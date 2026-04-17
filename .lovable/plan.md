
## Goal
Frontend-only sweep to remove remaining user-facing "Templates", "Workflows", "Presets" leaks. Replace with **Visual Studio** (destination) or **Visual Type** (selectable option). Zero backend, route, API, or DB changes.

## Scope (text-only edits in UI files)

### A. In-product UI
- `StartWorkflowModal.tsx:235` "Browse all templates" → "Browse Visual Studio"
- `CreativeDropWizard.tsx` lines 674, 942, 948, 1579, 1843 — swap "workflow(s)" → "Visual Type(s)"
- `UploadSourceCard.tsx:161` "across workflows" → "across Visual Types"
- `WorkflowPreviewModal.tsx:50,198` eyebrow/fallback "Workflow" → "Visual Type"
- `GenerateConfirmModal.tsx:91` label "Template" → "Visual Type"
- `generate/WorkflowSettingsPanel.tsx:766` "Locked by workflow" → "Locked by Visual Type"
- `Generate.tsx` template-step block (3835, 3857, 3869, 3887, 4335) — sweep "Template(s)" → "Visual Type(s)"
- `Dashboard.tsx:709` table column "Template" → "Visual Type" (keep line 592 "traditional workflow" — generic meaning)
- `Jobs.tsx:557,559` quote + "Explore Workflows" → "in Visual Studio or with Freestyle" / "Open Visual Studio"
- `Products.tsx:139` "across workflows" → "across Visual Types"
- `HelpCenter.tsx:143` SEO description "workflows" → "Visual Studio"
- `useDiscoverSubmissions.ts:85` "in Presets" → "in Explore"
- `lib/conversionCopy.ts:187` "creation workflows" → "creation runs"

### B. Public marketing
- `LandingFAQ.tsx:29,37` "Templates" → "Visual Types"
- `CreativeDropsSection.tsx:53` "visual templates" → "Visual Types"
- `FeatureGrid.tsx:54` "Assign templates" → "Assign Visual Types"
- `FinalCTA.tsx:32` "choose your templates" → "choose your Visual Types"
- `About.tsx:28,53,77` "workflow(s)" → "Visual Type(s)"
- `Press.tsx:77` "multiple templates" → "multiple Visual Types"
- `BrandProfilesFeature.tsx:17-18` "Reusable Presets" title → "Reusable across the studio"; body "any template" → "any Visual Type"

### C. Blog content
- `blogPosts.ts:528,577,620` "workflows" → "Visual Types"
- `mockData.ts:1516` "Automated workflows" → "Automated Visual Types"

### D. Page-level decisions (resolved, frontend-only)
- `src/pages/Templates.tsx` — retitle PageHeader "Templates" → "Visual Types"; table column "Template" → "Visual Type"; search "Search templates..." → "Search Visual Types…"; modal "Template preview and details" → "Visual Type preview and details"; "Use this template" → "Use this Visual Type". **Route stays `/app/templates/:id`.**
- `App.tsx:194` `/templates` redirect — **untouched** (route preserved).
- `blogPosts.ts:300` "[automated workflows]" — leave (blog slug link, generic noun).

## Out of scope (will NOT touch)
- Routes, redirects, API calls, edge functions, DB columns, types
- Component/file names (`WorkflowCard.tsx`, `StartWorkflowModal.tsx`, etc.)
- Code identifiers (`templateId`, `workflow_id`, `mockTemplates`)
- Admin pages (`AdminScenes.tsx`, `AdminFeedback.tsx`, etc.) — internal/technical context
- `CookiePolicy.tsx:53` "template cookie policy" / `TermsOfService.tsx:33` "proprietary workflows" — different meanings
- `Dashboard.tsx:592` "vs traditional workflow" — generic English

## Acceptance
- Zero user-visible "Templates"/"Workflows"/"Presets" referring to the creation feature
- All routes and backend untouched
- No layout or logic changes — text only
