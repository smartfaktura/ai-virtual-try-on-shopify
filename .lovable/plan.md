
## Audit Result — terminology sweep status

I scanned `src/**/*.{tsx,ts}` (excluding admin pages) for user-visible "Templates / Workflows / Presets" referring to the visual creation feature.

### ✅ Confirmed clean (previously approved batch landed)
All ~30 strings from the last approved sweep are updated: `CreativeDropWizard`, `WorkflowPreviewModal`, `GenerateConfirmModal`, `WorkflowSettingsPanel`, `Generate.tsx` template-step block, `Dashboard` table column, `Jobs.tsx` empty state, `Products.tsx`, `HelpCenter` SEO, `useDiscoverSubmissions`, `LandingFAQ`, `CreativeDropsSection`, `FeatureGrid`, `FinalCTA`, `About`, `Press`, `BrandProfilesFeature`, `blogPosts`, `mockData`, `Templates.tsx` page, `StartWorkflowModal`, `UploadSourceCard`.

### ⚠️ Remaining user-visible leaks found

| File:line | Current | Replace with |
|---|---|---|
| `src/components/app/ProductMultiSelect.tsx:63` | "…the same template will be applied to all…" | "…the same Visual Type will be applied to all…" |
| `src/pages/Generate.tsx:2171` | Badge `'Workflow'` (fallback when not Try-On) | `'Visual Type'` |
| `src/components/app/WorkflowRecentRow.tsx:149` | fallback `'Workflow'` when job has no name | `'Visual Type'` |
| `src/lib/conversionCopy.ts:93` | "…better value, and faster workflows." | "…better value, and faster runs." |
| `src/lib/conversionCopy.ts:138` | "…better value and faster workflows." | "…better value and faster runs." |
| `src/lib/conversionCopy.ts:165` | "…with more credits, better value, and faster workflows." | "…with more credits, better value, and faster runs." |
| `src/lib/conversionCopy.ts:169` | valueBlock title `'Faster Workflow'` | `'Faster Runs'` |
| `src/components/app/MissingRequestBanner.tsx:38-44` | `category === 'workflow'` branch text "Missing a feature or workflow?" / "Describe the workflow…" | branch is currently unused (no caller passes `category="workflow"`). Update copy to "Missing a feature or Visual Type?" / "Describe the Visual Type or feature you need…" for safety |

### ✅ Intentionally NOT changed (correct as-is)
- `WorkflowCard.tsx:106`, `WorkflowCardCompact.tsx:99` — render `{workflow.name}` (dynamic data, not the label "Workflow")
- `DiscoverDetailModal.tsx:303,325,390` — internal/admin debug panel showing DB type/slug
- `TermsOfService.tsx:33` — "proprietary workflows" (legal, generic noun)
- `ProductImagesStep3Refine.tsx:1258,1370` — "Preset name…" refers to a real saved-settings preset feature, not the deprecated terminology
- File names, type names, props (`workflow_slug`, `Workflow` type, `WorkflowType`) — internal code

## Proposed cleanup (text-only, frontend, ~7 strings)
Apply the replacements in the table above. No routes, props, types, or backend touched. After this, the platform has zero user-facing leaks.
