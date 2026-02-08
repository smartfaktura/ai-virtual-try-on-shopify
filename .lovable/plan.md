

# Fix: Enter Key Navigation in Brand Profile Wizard

## Problem

When a user fills in the "Brand Name" field on Step 1 and presses Enter, nothing happens. The wizard does not advance to the next step. This is because there are no keyboard event handlers on Step 1 inputs for step navigation.

The "Next" button works correctly when clicked with the mouse -- the issue is only with the Enter key.

## Root Cause

In `src/components/app/BrandProfileWizard.tsx`:
- The Step 1 inputs (`name`, `brand_description`, `target_audience`) have no `onKeyDown` handlers
- The wizard is not wrapped in a `<form>` element, so pressing Enter has no default submission behavior
- Enter key handlers only exist in later steps for adding chips (keywords, colors, rules) -- not for navigation

## Solution

Wrap the entire wizard card content and navigation in a `<form>` element with an `onSubmit` handler. When the user presses Enter:
- If on Step 1 or 2 and `canProceed` is true, advance to the next step
- If on Step 3 (final step), trigger the save action
- Prevent default form submission in all cases

This is the cleanest approach because it handles Enter on all inputs across all steps without needing individual `onKeyDown` handlers on every field.

## File Change

**`src/components/app/BrandProfileWizard.tsx`**

1. Add a `handleSubmit` function that checks the current step and either advances or saves
2. Wrap the card and navigation buttons in a `<form>` element with `onSubmit={handleSubmit}`
3. Change the "Next" and "Save" buttons to `type="submit"` so Enter triggers them naturally
4. Keep all existing `onKeyDown` handlers on keyword/color/rule inputs (they call `e.preventDefault()` implicitly via `e.key === 'Enter'` checks, but need explicit `e.stopPropagation()` to avoid also triggering form submit)

## Technical Details

```
New function:
  handleFormSubmit(e: FormEvent) {
    e.preventDefault()
    if step < last step and canProceed -> setStep(step + 1)
    if step === last step and name is valid -> handleSave()
  }

The chip-adding inputs (keywords, colors, rules) need
e.stopPropagation() added so Enter adds the chip
instead of also advancing the step.
```

Single file change, minimal diff.

