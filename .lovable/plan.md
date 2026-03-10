

## Replace Native Browser Validation with Branded Inline Errors

The screenshot shows the default browser "Please fill out this field" tooltip on the email input. This happens because the `<form>` uses native HTML `required` attributes. We need to switch to custom JavaScript validation with styled inline error messages.

### Changes in `src/pages/Auth.tsx`

1. **Add `noValidate` to the `<form>` tag** to suppress native browser tooltips
2. **Add validation state** (`errors` object) to track field-level errors
3. **Validate on submit** — check empty email, invalid email format, empty password, password min length
4. **Show inline error messages** below each input using a small red text styled consistently with the app's design system (e.g., `text-sm text-destructive mt-1`)
5. **Clear errors on input change** so errors disappear as the user types

### Error styling
- Small text below the field: `text-sm text-destructive mt-1`
- Input border highlight on error: add `border-destructive` class when field has error
- No native tooltips, no alert boxes — purely inline

### No other files need changes

