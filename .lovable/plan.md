Rework `BrandScenesInfoModal` into a quieter, editorial layout — less crowded, fully VOVV.AI restraint, and properly sized for mobile (390px).

**File:** `src/components/app/product-images/BrandScenesInfoModal.tsx`

**Layout (mobile-first, max-w-sm, p-7)**

1. Top row: small icon chip (10×10, `bg-muted` rounded-full, `Wand2` w-4) on the left only — no centered chrome.
2. Eyebrow label: `BRAND SCENES` — `text-[10px] tracking-[0.2em] uppercase text-muted-foreground` for editorial anchor.
3. Title: `text-[22px] leading-[1.15] font-medium tracking-tight text-foreground` — no terminal period. Single line target on mobile by tightening copy to "Scenes that belong to your brand".
4. Subtitle: `text-[13px] leading-relaxed text-muted-foreground font-light` — trimmed to one sentence: "Custom AI scenes built from your references, reused across every shoot".
5. Generous breathing space (`mt-7`) before features.
6. Three features as numbered hairline rows — no check icons:
   - Row = thin top border (`border-t border-border/60`), `py-3.5`, two columns: `01` (`text-[10px] tracking-widest text-muted-foreground/70 w-6`) + label (`text-[13px] text-foreground/85 leading-snug`).
   - Last row gets a closing bottom border so the block reads as a contained editorial list.
   - Copy stays as-is.
7. Action stack (`mt-7 space-y-2`):
   - Primary: full-width, `h-11`, `rounded-full`, `bg-foreground text-background`, label + `ArrowRight w-4` with subtle hover translate.
   - Secondary "Maybe later": `h-9` ghost, `text-[13px] text-muted-foreground hover:text-foreground`.
8. Gated footnote unchanged but `text-[10.5px] tracking-wide text-muted-foreground/80 text-center mt-2`.

**Mobile correctness**

- `DialogContent` keeps shadcn defaults but override to `max-w-sm w-[calc(100%-2rem)] p-7 rounded-3xl` so it never touches viewport edges on 390px.
- Title sized so it wraps to max two lines at 390px.
- Remove the centered icon-above-title stack from current version (that was the main "crowded" feel).

**Tokens only**

All colors via semantic tokens (`foreground`, `background`, `muted-foreground`, `border`) — no hex, no `text-white`/`text-black`.

**Out of scope**

- No change to plan-aware CTA logic (`canCreate`, `openBuyModal('brand-scenes-gate')`, `navigate('/app/brand-scenes')`).
- No change to `BrandScenesPromoCard` trigger.
- No copy changes beyond the title/subtitle tightening above.