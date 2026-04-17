

## Goal
Lock user-facing terminology to **Visual Studio** (the destination) and **Visual Types** (the selectable creation options). Eliminate user-facing "Templates", "Workflows", and "Presets" as competing labels. Keep `workflow*` in code, routes, DB tables, internal variables, and SQL.

## Current state (verified)
- Sidebar already says **Visual Studio** → `/app/workflows` ✅
- Page `/app/workflows` already titled **Visual Studio** ✅
- Many strings still leak old terms (Templates / Workflows / template / pipelines)

## Files to update (text-only, no logic changes)

### App / in-product
| File | Current | Replace with |
|---|---|---|
| `OnboardingChecklist.tsx:42` | "Go to Templates" | "Open Visual Studio" |
| `OnboardingChecklist.tsx:36` | "Generate Your First Visual Set" | keep (already aligned) |
| `DashboardTipCard.tsx:42` | "Use Workflows to generate complete visual sets — ads, listings, and hero images — in one click." | "Open Visual Studio to create complete visual sets — ads, listings, and hero images — in one click." |
| `DashboardQuickActions.tsx:7` | label: "Browse Templates" | "Visual Studio" |
| `Dashboard.tsx:539` | button "Visual Studio" | keep ✅ |
| `Freestyle.tsx:1057` | button text "Workflows" (links to /app/workflows) | "Visual Studio" |
| `WorkflowRequestBanner.tsx:72,107` | "Missing a template for your brand?" / "Describe the template, niche…" | "Missing a Visual Type for your brand?" / "Describe the Visual Type, niche, or product type you need…" |
| `GlobalGenerationBar.tsx:405` | "View in Templates" | "View in Visual Studio" |
| `Generate.tsx:1174` | toast "Please select a template first" | "Please select a Visual Type first" |
| `Generate.tsx:1175` | "Template-based generation is no longer supported. Please use a workflow." | "This Visual Type is no longer supported. Please pick another from Visual Studio." |
| `HelpCenter.tsx:15` | "…head to Workflows. Choose from seven core workflows…" | "…head to Visual Studio. Choose from seven Visual Types…" |
| `StudioChat.tsx:19,20` | chip "Show me workflows" / "Which workflow fits my product?" | "Show me Visual Types" / "Which Visual Type fits my product?" |
| `Generate.tsx:2157` | back-action "Visual Studio" | keep ✅ |

### Public marketing
| File | Current | Replace with |
|---|---|---|
| `LandingFAQ.tsx:14` | "Templates are purpose-built generation pipelines. Choose from six core options…" | "Visual Types are built for specific content goals. Choose from six core options…" |
| `LandingFAQ.tsx:21` | "…none of the standard Workflows fit your vision." | "…none of the standard Visual Types fit your vision." |
| `LandingFAQ.tsx:33` | "…across Workflows and Freestyle…" | "…across Visual Studio and Freestyle…" |
| `LandingFAQ.tsx:41` | "…run your first Workflow or try Freestyle…" | "…run your first Visual Type or try Freestyle…" |
| `LandingPricing.tsx:119` | "…try multiple workflows…" | "…try multiple Visual Types…" |
| `LandingPricing.tsx:594` | "Try every workflow…" | "Try every Visual Type…" |
| `LandingPricing.tsx:57` | matrix group "Brand & workflow" | "Brand & studio" |
| `LandingFooter.tsx:6` | footer link "Templates" → /features/workflows | "Visual Studio" |
| `BrandProfilesFeature.tsx:35-36` | step "Attach to Workflows" / "Link your Brand Profile to any template…" | "Attach in Visual Studio" / "Link your Brand Profile to any Visual Type…" |
| `WorkflowsFeature.tsx` (full sweep, user-facing copy only) | hero badge "Templates", H2 "Why Templates?", step "Pick a Template", CTA "Try {name} Free", body uses "template" repeatedly | hero badge "Visual Studio"; H1 keeps; H2 "Why Visual Types?"; step "Pick a Visual Type"; replace "template" → "Visual Type" in benefits, steps, CTA copy; SEO title → "AI Photography Visual Types — VOVV.AI" (slug/route stays `/features/workflows`) |
| `HeroSection.tsx:245` | route to `/app/workflows` | keep route, no copy change needed |

## Out of scope (do NOT change)
- Routes (`/app/workflows`, `/features/workflows`) — keep
- DB tables, columns, RLS, edge functions, types (`Workflow`, `workflow_id`, `workflow_slug`)
- `src/pages/Templates.tsx` and `mockTemplates` — separate legacy admin/data file, not user-routed in current nav (verify; if surfaced, retitle later)
- Internal variable names, comments, SQL labels in admin pages (`AdminScenes.tsx` "On-Model → Try-On Workflows" — admin-only, keep)
- Code-level types: `templateId`, `templateSnapshot` on Job records
- "Freestyle" naming (separate feature, untouched)
- Cookie policy line "template cookie policy" (different meaning of "template")

## Acceptance
- Zero user-facing occurrences of "Templates", "Workflows", or "Presets" used as a synonym for the visual creation feature
- "Visual Studio" used for the page/destination
- "Visual Types" used for the selectable options
- All routes, DB, code identifiers untouched
- No layout, logic, or pricing changes

## Mental model after change
**Open Visual Studio → choose a Visual Type → generate the result.**

