## Add Discord community link across the app

Invite URL: `https://discord.gg/ZgnSJqUyV` (note: this looks short — please verify it's a working invite before going live)

### 1. Public marketing — `LandingFooter.tsx`
Add a Discord icon as a 4th social icon (after TikTok), same styling as the existing Instagram/Facebook/TikTok icons. Use a custom inline SVG (lucide-react has no Discord icon).

### 2. Public marketing — `HomeFooter.tsx`
Add a "Join our Discord" link to the **Support** column links list:
```ts
{ label: 'Discord community', to: 'https://discord.gg/ZgnSJqUyV' }
```
Adjust the link renderer to use `<a target="_blank">` when `to` starts with `http`, otherwise keep `<Link>`.

### 3. In-app — `AppHelp.tsx` (`/app/help`)
Two additions:
- **Quiet helper row**: insert a new row between "Browse FAQs" and "Tutorials & guides" with a Discord SVG icon, title "Join our Discord", subtitle "Chat with the team & other creators", external link with `ArrowUpRight`.
- **Footer social row**: add `{ label: 'Discord', href: 'https://discord.gg/ZgnSJqUyV' }` to the `socialLinks` array.

### 4. In-app — `AppShell.tsx` user menu
Add a new menu item "Join Discord" between **Bug Bounty** and **Earn Credits**, opening the invite in a new tab (use an `<a target="_blank" rel="noopener noreferrer">` styled like the existing `<button>` rows). Use a Discord SVG icon (~16px) inline.

### Technical notes
- Discord SVG path will be reused via a tiny inline component or duplicated (matching how the TikTok SVG is currently inlined in `LandingFooter.tsx`).
- All external links: `target="_blank" rel="noopener noreferrer"` and `aria-label="Discord"` where icon-only.
- No new dependencies, no schema changes, no env changes.

### Files touched
- `src/components/landing/LandingFooter.tsx`
- `src/components/home/HomeFooter.tsx`
- `src/pages/AppHelp.tsx`
- `src/components/app/AppShell.tsx`
