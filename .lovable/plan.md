

## Clean Up Signup Email - Copy-Friendly Code, Remove Divider, Polish Branding

### User Issues
1. **No easy way to copy the code** - wants a copy button or at least make the code easy to select/copy
2. **Ugly bold grey divider line** - the `--- or ---` section looks bad, remove it
3. **Overall polish** - make it cleaner and more VOVV.AI branded

### Changes to `supabase/functions/_shared/email-templates/signup.tsx`

#### 1. Make code copyable
Email clients don't support JavaScript (no clipboard API), so a real "copy" button won't work. Instead:
- Render the full 6-digit code as a **single large text string** (not individual digit boxes) so users can easily select and copy it with one click/drag
- Style it as a centered, large, bold, well-spaced string inside a light rounded container
- The individual digit boxes look nice but are hard to select as text — switching to a single string is the UX-correct move for email

#### 2. Remove the divider
- Delete the entire `dividerSection` with the `--- or ---` table
- Replace with simple subtle text: "or verify directly" as a link styled inline, no heavy divider

#### 3. Polish the layout
- Keep the VOVV.AI wordmark at top
- Clean heading: "Verify your account"
- Subtitle with email address
- **Hero code block**: single large number string in a rounded container with `letter-spacing: 0.3em` for readability
- Expiry hint below
- Small "or verify directly →" text link (no button, no divider)
- Footer disclaimer
- Footer with copyright + 123Presets attribution, using a subtle top border (thin, light)

#### 4. Refined styles
- Remove: `dividerSection`, `dividerLine`, `dividerLabel`, `altText`, `button`, `digitTable`, `digitCell`, `digitText`
- Add: `codeBlock` (container with bg, border-radius, padding), `codeText` (large Inter font, spaced), `verifyLink` (small text link)

### File
- `supabase/functions/_shared/email-templates/signup.tsx` — rewrite template
- Redeploy `auth-email-hook`

