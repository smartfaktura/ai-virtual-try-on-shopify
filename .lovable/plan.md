
## Problem

The newsletter HTML has several issues causing broken rendering on mobile email clients:

1. **Negative margins** on `.cta-section` and `.reply-section` (`margin: 0 -48px`) — this causes horizontal overflow and broken layout, especially in email clients that strip `<style>` tags
2. **CSS class-based styling** — many email clients (Gmail, Outlook) strip `<style>` blocks entirely, so all class-based styles break
3. **`display: flex`** in `.stat-row` — not widely supported in email clients
4. **`@import` for Google Fonts** — stripped by most email clients

## Fix — `/mnt/documents/vovv-newsletter-week-update.html`

1. **Inline all styles** — Move every CSS property into `style=""` attributes directly on elements. Remove the `<style>` block (keep only a minimal reset).

2. **Remove negative margins** — Move the CTA section and Reply section outside the `.content` wrapper so they naturally span full width without negative margin hacks.

3. **Use table-based layout throughout** — Replace all `<div>` containers with `<table>` / `<tr>` / `<td>` for maximum email client compatibility.

4. **Inline the font-family fallback** — Replace `@import` with inline `font-family` stacks on every text element.

5. **Add `width` attributes on tables** — Use HTML `width` attributes alongside `max-width` CSS for Outlook compatibility.

6. **Mobile-safe padding** — Use `padding: 40px 24px` everywhere (no 48px that needs a media query override). This gives consistent rendering whether or not the `<style>` block is preserved.

The result will be a fully inlined, table-based HTML email that renders correctly across Gmail (mobile + desktop), Apple Mail, Outlook, and Yahoo.
