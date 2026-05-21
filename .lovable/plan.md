# Strengthen Terms for face/likeness uploads + add dedicated signup consent

The "Reference photo → Generate a model from a real person → Upload a face" flow is our highest legal-risk feature: GDPR biometric data, right-of-publicity, deepfake/IPED laws, NCII risk, minors. Current Terms cover this only with a one-liner ("Use real people without consent"). We need explicit, enforceable clauses **and** a separate, unmissable consent at signup so we have a clean paper trail.

## 1. Add a new dedicated section to `TermsContent.tsx`

Insert a new **Section 10 — Face, Likeness & Biometric Uploads (Critical)** between current §9 (Acceptable Use) and current §10 (Your Responsibility). Renumber subsequent sections. Mirror the same section in `PrivacyContent.tsx` under a "Biometric & Likeness Data" heading so GDPR Art. 9 is covered.

Content covers, in plain English:

- The "Reference photo" feature lets you upload a face to generate an AI model resembling that person.
- **You warrant** that for every face you upload you either: (a) are that person, or (b) hold the person's explicit, informed, written consent to upload their face to an AI generation service, create AI imagery resembling them, and use those generations commercially.
- **You will NOT** upload faces of: minors (under 18), public figures / celebrities / politicians without rights, deceased persons without estate consent, or any person who has asked you to stop.
- **You will NOT** use generations to: impersonate, defame, harass, create sexual or intimate content of a real person (NCII / "deepfake porn" — strictly prohibited and reported to authorities), influence elections, commit fraud, or breach right of publicity / personality rights in any jurisdiction.
- Uploaded face images are treated as **biometric / special-category data** under GDPR Art. 9. Lawful basis is your **explicit consent** (and the consent of the data subject if different). You can withdraw and request deletion at any time via hello@vovv.ai.
- We may, at our sole discretion, **block, remove, refuse to generate, suspend the account, and report to law enforcement** any upload that appears to violate this section, with no refund.
- You **indemnify** VOVV.AI in full for any claim, fine, regulatory action, or damages (including GDPR Art. 82, right-of-publicity, defamation, IP, NCII statutes such as US TAKE IT DOWN Act, UK Online Safety Act, EU AI Act Art. 50) arising from a face or likeness you uploaded.
- Liability cap in §17 does **not** apply to your indemnity under this section (carve-out, standard practice).

Also tighten existing §9 "Acceptable Use" bullet from "Use real people without consent" → "Upload, generate, or distribute imagery of any real person without that person's documented, explicit consent — see §10".

## 2. Add a second mandatory checkbox at signup

In `src/pages/Auth.tsx` (signup branch only), add a **second required checkbox** below the existing Terms checkbox, separate from it so the consent is itemized and timestamped distinctly:

> I understand that if I upload a photo of a real person, I am solely responsible for having that person's explicit consent, that I will never upload faces of minors or non-consenting individuals, and that creating sexual, harassing, or deceptive content of real people is strictly prohibited.

State: `likenessAccepted` / `setLikenessAccepted`, validated in the same `errs` block, error key `likeness`. Submit is blocked unless both checkboxes are ticked. Marketing opt-in stays optional and unchanged.

Visually it sits between the Terms checkbox and the Marketing opt-in, same styling.

## 3. Persist the consent (audit trail)

When signup succeeds, write a row to a small new table `user_consents` capturing:

- `user_id`, `terms_version` (e.g. `'2026-05-21'`), `likeness_version`, `marketing_opt_in`, `ip` (from request header), `user_agent`, `accepted_at` (now).

Migration adds the table with RLS: users can `INSERT` their own row, `SELECT` their own rows; no `UPDATE` / `DELETE`. Service role bypasses. Bump a `TERMS_VERSION` constant in a new `src/lib/legal-versions.ts` so future re-acceptance is easy.

Insert happens client-side right after `supabase.auth.signUp` returns a user, in the existing signup handler in `Auth.tsx`.

## Technical details

- Files edited: `src/components/legal/TermsContent.tsx`, `src/components/legal/PrivacyContent.tsx`, `src/pages/Auth.tsx`.
- Files added: `src/lib/legal-versions.ts`, one migration creating `public.user_consents` + RLS policies + index on `(user_id, accepted_at desc)`.
- No changes to the BrandModels reference-photo flow itself in this pass — pure legal hardening + signup consent + audit row.
- No changes to login flow (existing users won't be re-prompted now; we can add a re-acceptance modal in a follow-up if you want).

## Out of scope

- Re-prompting existing users to re-accept new Terms (can do as a follow-up modal gated on `TERMS_VERSION`).
- In-flow consent inside the reference-photo upload step itself (recommended next step, but separate task).
- Translations.
