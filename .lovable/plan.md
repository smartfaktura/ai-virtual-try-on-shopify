## Mobile polish + shorter headline for `brand-scenes-newsletter.html`

### Headline
Replace "Two new ways to shoot your brand — without shooting" with **"Shoot your brand — without shooting"** (hero H1).

### Mobile CSS (≤620px @media block)
- Reduce card inner padding: `.px` → `padding:0 18px !important` plus add `.cardpad{ padding:28px 22px 30px 22px !important; }` and apply to hero/section/CTA inner cells.
- Hero H1: `font-size:30px !important; letter-spacing:-.6px !important;` (smaller than current 34px override).
- Section H2 (`.h2`): add class, scale to `22px !important`.
- Upgrade H2 (`.h2dark`): scale to `24px !important`.
- Body copy `.body` class → `font-size:14px !important`.
- Brand Models grid: keep 4-up but tighten — switch `.grid4 .pair` to 2-per-row (`width:48% !important; padding:0 4px 8px 4px !important;`) so faces stay readable.
- Brand Scenes grid: stays 3-up but reduce gutter via overriding td padding to `2px`.
- Footer columns already stack via `.fcol`. Add `text-align:left` + margin reset.
- Outer wrapper padding `28px 12px` → `16px 0` on mobile to use full width.
- Hero CTA + section CTAs: add `.btn` class, on mobile `display:block !important; text-align:center; width:100%; box-sizing:border-box;`.
- Footer top row (wordmark + tagline) stacks on mobile (`.fhead td{ display:block !important; width:100% !important; text-align:left !important; padding-bottom:6px;}`).
- Footer bottom row (copyright + view/unsub) also stacks left-aligned on mobile.

### Class additions in markup
Tag the relevant `<td>`/`<h1>`/`<h2>`/`<p>`/`<a>` with the new classes (`cardpad`, `h2`, `h2dark`, `body`, `btn`, `fhead`) without changing desktop styles.

No content rewrites besides the headline.
