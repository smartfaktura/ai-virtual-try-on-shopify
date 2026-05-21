# Strengthen Terms of Service for face / likeness uploads

The "Reference photo → Generate a model from a real person → Upload a face" flow is our highest legal-risk feature: GDPR biometric data, right-of-publicity, deepfake / NCII laws, minors. Today the Terms cover this with a single bullet ("Use real people without consent"). We harden the **main Terms of Service** so users explicitly accept these rules at signup via the existing single checkbox — no extra checkbox added.

## 1. Tighten existing §9 "Acceptable Use"

Replace the soft bullet "Use real people without consent" with a stronger, itemized list (still inside §9):

- Upload, generate, or distribute imagery of any real person without that person's documented, explicit consent
- Upload faces of minors (under 18) under any circumstance
- Upload faces of public figures, celebrities, politicians, or any third party you do not have rights to
- Create sexual, intimate, nude, or suggestive content depicting a real person (strictly prohibited — may be reported to authorities)
- Create content intended to defame, harass, impersonate, blackmail, or deceive
- Create political disinformation, election-influencing content, or fraudulent material
- Use generations in any way that breaches right-of-publicity, personality rights, defamation, or data-protection laws in any jurisdiction

## 2. Add a new dedicated section: §10 — Face, Likeness & Biometric Uploads (Critical)

Inserted between current §9 and current §10 (existing sections renumber by +1). Plain-English content:

- The Reference Photo feature lets you upload a face so we can generate an AI model resembling that person. By using it you make the warranties below.
- **You warrant** that for every face you upload either (a) you are that person, or (b) you hold that person's explicit, informed, written consent to upload their face to an AI generation service, create AI imagery resembling them, and use those generations commercially.
- Uploaded face images are **biometric / special-category data** under GDPR Art. 9. The lawful basis is your explicit consent (and the data subject's, if different). The data subject may withdraw consent and request deletion at any time via hello@vovv.ai.
- We may, at our sole discretion and without refund, **block, remove, refuse to generate, suspend, or terminate** any account and **report to law enforcement** any upload that appears to violate this section.
- You **fully indemnify** VOVV.AI for any claim, fine, regulatory action, or damages — including under GDPR Art. 82, right-of-publicity / personality-rights laws, defamation, IP, the US TAKE IT DOWN Act, the UK Online Safety Act, and EU AI Act Art. 50 — arising from a face or likeness you uploaded or a generation you created.
- The liability cap in §18 (renumbered) does **not** apply to amounts you owe under this indemnity (standard carve-out).

## 3. Renumber and adjust references

Current §10–§24 shift to §11–§25. Update the in-text reference inside §17 (Limitation of Liability — becomes §18) so any cross-reference still resolves correctly. Privacy Policy gets a short matching paragraph under a "Biometric & Likeness Data" heading pointing back to Terms §10.

## 4. No UI / flow changes

- Signup keeps its single existing "I agree to the Terms of Service and Privacy Policy" checkbox — no second checkbox added.
- BrandModels reference-photo flow itself is not changed in this pass.
- No DB migration, no audit-log table, no version constant — purely a legal-copy update.

## Technical details

- Files edited: `src/components/legal/TermsContent.tsx`, `src/components/legal/PrivacyContent.tsx`.
- No other files touched. No schema, no Auth.tsx changes.

## Out of scope

- Re-prompting existing users to re-accept the updated Terms.
- In-flow consent inside the reference-photo upload step (recommended as a follow-up).
- Translations.
