## 1. `/app/brand-scenes` — match standard page header

`src/pages/BrandScenes.tsx` currently hand-rolls the title block with `space-y-8 sm:space-y-10` and a `flex flex-wrap` row. Replace with the shared `PageHeader` (same component used by Brand Models, Product Images, etc.) so size, spacing, and tracking are identical across app pages.

- Import `PageHeader` from `@/components/app/PageHeader`.
- Change outer wrapper to `className="space-y-6"` (matches Brand Models).
- Replace the title row (lines ~120-136) with:
  ```tsx
  <PageHeader
    title="Brand Scenes"
    subtitle="Signature scenes saved to your brand — reuse them on any product"
    actions={
      hasScenes && canCreate ? (
        <Button onClick={() => navigate('/app/brand-scenes/new')} className="rounded-full font-semibold gap-2">
          <Plus className="w-4 h-4" /> New brand scene
        </Button>
      ) : null
    }
  >
    {null}
  </PageHeader>
  ```
- Keep SEOHead, upgrade banner, grid, empty/upgrade states, and delete dialog as-is.

Result: same h1 size (`text-2xl sm:text-3xl`), subtitle gap (`mt-1.5`), and bottom spacing as every other app page.

## 2. `/app/brand-scenes/new` — add page header, subtitle, back button

`src/pages/BrandSceneWizard.tsx` renders `<Wizard />` directly with no page-level header. Add a back button + title + subtitle above the wizard, matching the `BrandModelNew` pattern.

- Import `useNavigate`, `ArrowLeft`, `Button`.
- Wrap the wizard in a container and add a header block above it:
  ```tsx
  <div className="max-w-2xl mx-auto w-full">
    <div className="mb-4 sm:mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/app/brand-scenes')}
        className="gap-1.5 -ml-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Brand Scenes
      </Button>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">New brand scene</h1>
      <p className="text-base text-muted-foreground mt-1.5">
        Design a signature scene saved to your brand library
      </p>
    </div>
    <Wizard />
  </div>
  ```
- Width `max-w-2xl` matches the wizard's own inner column so the back/title align with the step content.
- Keep the existing admin/plan guard and `data-hide-studio-chat` effect.

No backend, no wizard-internal changes.
