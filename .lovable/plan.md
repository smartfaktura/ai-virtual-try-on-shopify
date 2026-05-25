Make the "Create Your Brand Model" card on `/app/generate/product-images` (Model Selection step) open an informational dialog instead of navigating away. The dialog explains what Brand Models are and offers a clear next step depending on the user's plan.

**New component**

`src/components/app/product-images/BrandModelsInfoModal.tsx` — small `Dialog` (shadcn) with:
- Icon + title: "Bring your brand model to every shot"
- Short description: unlimited custom AI models matched to your brand identity
- 3 benefit bullets (reusing the copy from `BrandModels.tsx` `UpgradeHero`):
  - Brand consistency across every campaign
  - Any ethnicity, age, gender, body type
  - Upload a reference or describe from scratch
- Footer CTA, plan-aware (read `plan` from `useCredits()`):
  - Growth / Pro / Enterprise → primary "Create Brand Model" → `navigate('/app/models')` + close
  - Free / Starter → primary "Upgrade plan" → `openBuyModal('brand-models-gate')` + close
- Secondary "Maybe later" / close button

**Wire-up**

`src/components/app/product-images/ProductImagesStep3Refine.tsx`:
- Add `useState` for `infoOpen` inside `ModelPickerSections`.
- Replace the card's `onClick` (currently calls `onUpgradeClick` for free or navigates to `/app/models`) with `setInfoOpen(true)`.
- Render `<BrandModelsInfoModal open={infoOpen} onOpenChange={setInfoOpen} />` next to the card.
- Remove direct `navigate` / `onUpgradeClick` from that one click path; the modal handles both branches now. Keep `onUpgradeClick` prop intact (still used by other CTAs in the same component, e.g. the "Free plan: 1 model per generation — Upgrade" inline link).

**Out of scope**

- Catalog flow (`CatalogStepModelsV2.tsx`) — user only asked about Product Images. Leave it.
- No changes to `BrandModels.tsx`, plan gating logic, or `GlobalUpgradeModal`.