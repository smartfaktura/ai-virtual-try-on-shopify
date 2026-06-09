## Fixes for all 7 fashion-welcome emails

### 1. Signature wrapping next to CTA button (the "— Tomas, VOVV" bug)
The final CTA uses a left-aligned `<table>` for the button, then the `— Tomas, VOVV` paragraph follows in the same `<td>`. In many clients (and the preview screenshot) the paragraph wraps to the right of the floated button instead of below it.

Fix: wrap the button in its own full-width table row and put the signature in a separate `<tr>` / block below, with a real `clear` via a spacer table. Increase top margin on signature to 48px.

### 2. Spacing audit (apply across all 7)
- Outer container side padding normalized to **44px** everywhere (header, headline, hero, lists, CTA, footer) — currently mixed.
- Headline block: `padding: 24px 44px 36px` (was 28/32 mixed) so headline → intro → CTA breathes evenly.
- Hero image block: `padding: 0 44px 40px` (was 24px — too tight against next section).
- Grey section: `padding: 56px 44px` (was 48px) and grid row gap **12px** (was 10px).
- Bullet list: row padding `12px 0` (was 10px), and add `padding: 8px 44px 32px` around the list wrapper.
- Final CTA block: `padding: 40px 44px 64px`, signature `margin-top: 56px` and on its own row.
- Footer: top padding `48px`, internal line-height `1.7`.

### 3. Footer — add social links
Add a single row of text links above the disclaimer, separated by a middle dot:
`Instagram · TikTok · LinkedIn · vovv.ai`
Styled as muted grey 12px Inter, 600 weight, no underline, with `padding-bottom: 16px`. Links:
- Instagram → `https://instagram.com/vovv.ai`
- TikTok → `https://tiktok.com/@vovv.ai`
- LinkedIn → `https://linkedin.com/company/vovv-ai`
- Website → `https://vovv.ai`

### 4. Resend unsubscribe merge tag
Replace the static footer copy *"Manage your email preferences in your account settings"* with:

```
You are receiving this email because you signed up for VOVV.AI. 
<a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a>
```

`{{{RESEND_UNSUBSCRIBE_URL}}}` is Resend's dynamic merge tag — it gets replaced per-recipient at send time and also sets the `List-Unsubscribe` header automatically when used in a Broadcast/Audience send.

### 5. Brand name consistency
Replace remaining bare `VOVV` mentions in body copy with `VOVV.AI` per the brand rule (header logo + signature stay as short `VOVV`).

### Mechanics
Single edit pass on `/tmp/build_emails.py`:
- Update `SHELL` template spacing constants and footer block (social row + Resend unsubscribe tag).
- Restructure `cta_block()` so the signature sits in its own `<tr>` below the button, not adjacent to it.
- Body copy sweep: `VOVV` → `VOVV.AI` where it appears as a product reference (not the header logo or `— Tomas, VOVV` signature).

Then regenerate all 7 `.html` files and re-emit artifacts.
