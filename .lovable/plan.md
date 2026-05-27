## Restore the Brand Scenes explainer modal

In `src/components/app/product-images/BrandScenesPromoCard.tsx`, revert the CTA behavior so it opens `BrandScenesInfoModal` again instead of navigating straight to `/app/brand-scenes/new`.

Changes:
- Re-add `useState` and the `BrandScenesInfoModal` import
- Remove `useNavigate`
- Button `onClick` → `setOpen(true)`
- Render `<BrandScenesInfoModal open={open} onOpenChange={setOpen} />` at the end

Keep the new copy (heading, subtitle, "Create Brand Scenes" label, ArrowRight icon) — only the click behavior changes back. The modal itself already contains a CTA into the wizard, so the flow becomes: banner → explainer modal → wizard.