

# Add "Earn Credits" Gift Button + Premium Modal with Pre-filled Email

## Changes

### File 1: `src/components/app/EarnCreditsModal.tsx` (NEW)

Premium branded dialog with:

**Hero**: Amber/gold gradient header with Gift icon, headline "Unlock 50 Free Credits", subtitle "Share your best creation and get rewarded"

**3 numbered steps** in clean cards:
1. "Create something stunning" — Use any VOVV.AI tool
2. "Share & tag us" — Post on Instagram/TikTok, start caption with "Made with @VOVV.AI"
3. "Send us the link" — We drop 50 credits within 24h

**CTA button**: "Claim My Credits →" — opens `mailto:hello@vovv.ai` with:
- Subject: `I posted something I made with VOVV.AI!`
- Body: pre-filled template with placeholders for post link and account email (matching the Kive.ai reference screenshots)

```
Subject: I posted something I made with VOVV.AI!

Link to my post: [paste your link here]
Add credits to my account: [your VOVV.AI email]
```

**Instagram link**: @vovv.ai with external link icon

**Fine print**: "One reward per account per month. Account must be 7+ days old. We review every submission personally."

Styling: dark card background, amber accent gradient, Inter font, rounded-2xl, matches the app's luxury dark aesthetic.

### File 2: `src/components/app/AppShell.tsx`

- Import `Gift` from lucide-react and `EarnCreditsModal`
- Add `earnCreditsOpen` state
- Insert gift button between the `</nav>` close (line 184) and the Credits `border-t` section (line 186):
  - **Expanded sidebar**: Row with Gift icon + "Earn Credits" label, styled `text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/10`, rounded-lg, with subtle transition
  - **Collapsed sidebar**: Gift icon only centered, with `title="Earn Credits"` tooltip
- Render `<EarnCreditsModal open={earnCreditsOpen} onOpenChange={setEarnCreditsOpen} />` at the bottom of the component

## Summary
- 1 new file, 1 modified file
- Gift icon above credits in sidebar
- Premium modal with pre-filled mailto flow matching Kive.ai UX
- Works in expanded, collapsed, and mobile sidebar states

