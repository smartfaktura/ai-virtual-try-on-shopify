# Rewrite VOVV.AI Terms & Conditions

Content-only rewrite of the legal Terms page. No business logic, signup flow, checkout, pricing, credit, auth, payment, RLS, or DB changes.

## Scope

**File to edit (only one):**
- `src/components/legal/TermsContent.tsx` — full body rewrite, keeping current presentational wrapper (`prose` styling), `privacyLink` dialog, and component signature so both `/terms` and the in-Auth signup modal continue to render.

**Files untouched:**
- `src/pages/TermsOfService.tsx` (page chrome unchanged)
- `src/pages/Auth.tsx` and all signup/checkout/credit logic
- `PrivacyContent.tsx` (separate document)

## New structure (30 sections)

1. Definitions (adds Free Generations)
2. Acceptance of Terms — covers registration, use, checkout, download/export
3. Eligibility — 16+ general, 18+ for purchases
4. Account Responsibility
5. Service Description
6. Experimental / Beta Features
7. Availability
8. Credits, Subscriptions, Payments & Free Trials — credits expire each period, no rollover, non-refundable, no cash value; subscription renewal/cancellation rules; failed-payment suspension; tax handling; EU consumer withdrawal with immediate-access waiver; free-trial commercial-use restriction
9. Acceptable Use (incl. 9.1 Child safety & minors)
10. Face, Likeness & Biometric Uploads — strict, indemnity carve-out from liability cap
11. Scene, Brand Scene & Reference Image Uploads — strict, indemnity carve-out
12. User Responsibility — incl. downstream use by clients/agencies/team
13. AI Limitations — outputs probabilistic; no guarantee of accuracy/fidelity/approval
14. AI Transparency & Disclosure — user owns disclosure obligations; no removing watermarks
15. Intellectual Property & Commercial Use — "we don't claim ownership" framing; no guarantee of copyrightability/non-infringement; free Generations not for commercial use
16. No Training of Private Content — no training on private Inputs/Generations; providers process only to operate Service; explicit opt-in required for any future training feature
17. Confidentiality
18. Third-Party Services — Google, OpenAI, Kling and others; may change anytime; no liability for outages or model behaviour
19. Indemnification
20. Limitation of Liability — capped at greater of 3 months fees or €100; carve-outs for face/reference indemnities and mandatory law
21. Disclaimer
22. Copyright, Rights & Content Complaints
23. DSA Compliance & Content Moderation — automated + human moderation; complaint route to hello@vovv.ai
24. Termination
25. Data Portability, Deletion & EU Data Act — no blanket 2-month deletion notice; GDPR rights handled separately
26. GDPR — Controller & Processor Roles — controller for account/billing/security data, processor for Inputs
27. Governing Law — Lithuania
28. Changes to Terms
29. General (entire agreement, severability, assignment, force majeure)
30. Company Information — MB 123PRESETS, code 306675527, VAT LT100016637411, Vilnius address, hello@vovv.ai

## Writing rules followed

- British English (authorised, recognisable, behaviour)
- Protective, professional tone — no casual phrasing
- No guarantees of copyright, originality, non-infringement, accuracy, commercial suitability, or platform approval (Meta/TikTok/Google/Amazon/Shopify/Etsy)
- No promises of provider availability
- Strict face/likeness and reference-image clauses with indemnities excluded from liability cap
- "Free trial = no commercial use" stated in §8.5 and reinforced in §15
- "Credits expire each period, no rollover, non-refundable" stated in §8.1
- "No training of private content" stated in §16
- "Paid Generations may be used commercially subject to Terms and law" stated in §15, not conflicting with §8.5
- Last updated: 25 May 2026

## Verification

After build: load `/terms` in preview to confirm:
- Renders cleanly on desktop + mobile widths
- Privacy Policy dialog still opens from inline links
- No duplicate or conflicting clauses
- Headings/spacing consistent with existing `prose` styles

Switch to build mode to apply.
