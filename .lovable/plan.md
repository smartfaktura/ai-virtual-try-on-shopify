## Goal

On `/app/models/new` step 1, replace the auto-advance card click with a **select-then-Next** pattern matching brand-scenes — selection highlights the card via `WizardCard active`, and a sticky pill footer holds **Back** + **Next**. Also tighten the step 1 heading + subtitle copy.

## Changes — `src/pages/BrandModels.tsx` (`layout === 'sections'` block, lines 932–1135)

1. **Pending selection state** (inside the `if (layout === 'sections')` branch, before `chooserContent`):
   ```ts
   const [pendingMode, setPendingMode] = useState<'manual' | 'reference' | null>(null);
   ```
   *(Hoist with the other component-level state at the top of the component, not inside the branch — branches can't host hooks. Place it next to `creationMode`.)*

2. **Chooser cards become selectable, not auto-advancing**:
   ```tsx
   <WizardCard
     active={pendingMode === 'manual'}
     onClick={() => setPendingMode('manual')}
     icon={<Wand2 className="w-5 h-5" />}
     title="Start from scratch"
     body="Pick gender, age, and look — we'll generate it"
   />
   <WizardCard
     active={pendingMode === 'reference'}
     onClick={() => setPendingMode('reference')}
     icon={<UserCheck className="w-5 h-5" />}
     title="Use a reference photo"
     body="Upload a face — we'll build the model from it"
   />
   ```

3. **Shortened copy** (step 1 only):
   - Title: `"Start your model"` (was `"How do you want to build this model?"`)
   - Subtitle: `"From scratch or from a reference photo"` (was `"Pick a starting point"`)
   - Step 2 copy unchanged.

4. **Sticky footer on BOTH steps** — change `{currentStep === 2 && (…)}` to always render. Footer content branches by step:
   - **Step 1:** Back button routes to `/app/models` (use existing `navigate` from `useNavigate`, or call an `onCancel`-style prop if the wizard already takes one — check parent `BrandModelNew.tsx`). Primary button = **Next**, disabled until `pendingMode`. On click: `setCreationMode(pendingMode!)`. No validation/credits row on step 1.
   - **Step 2:** Existing Back (`handleStepBack` — also clears `pendingMode`) + Generate behavior unchanged.

5. **Bottom padding consistency**: change line 1080 to always use `pb-28 sm:pb-10` so step 1 has room for the now-present sticky footer.

## Step 1 Back behavior

Check `BrandModelNew.tsx` to see if it already exposes a parent back button → if yes, step 1 Back simply navigates to `/app/models` via `useNavigate`. (No prop plumbing needed — `useNavigate` is already imported in this file.)

## Out of scope

- Step 2 layout, validation, Generate logic — unchanged.
- Card grid breakpoints — unchanged.
- No backend, no data changes.
