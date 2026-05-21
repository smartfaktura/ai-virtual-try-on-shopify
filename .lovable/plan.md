# Extend Terms of Service to cover Brand Scene reference uploads

Brand Scenes lets users upload **any image** as a scene/composition reference that the AI will mimic. That opens a second high-risk surface (after face uploads): copyrighted photography, other brands' campaign shots, paparazzi images, trademarked sets, private-property interiors, etc. We add a dedicated clause so users explicitly accept the rules at signup via the existing single Terms checkbox — no UI change.

## 1. Add new §11 — Scene & Reference Image Uploads

Inserted right after the existing §10 (Face, Likeness & Biometric Uploads). Existing §11–§25 shift to §12–§26. The §18 cross-reference in the indemnity carve-out is updated to point to the renumbered Limitation of Liability.

Content (plain-English):

- Brand Scenes and similar features let you upload any image as a **style, composition, or scene reference** that the Service will use to influence Generations. By uploading you make the warranties below.
- **Rights warranty.** You warrant that for every reference image you upload you either (a) own it, (b) hold a written licence covering AI ingestion and the creation of derivative works, or (c) the image is in the public domain or under a licence (e.g. CC0) that clearly permits this use. Stock-photo previews, Pinterest pins, Google Images results, screenshots of other brands' campaigns, magazine scans, film stills, and watermarked previews are **not** acceptable references.
- **No third-party brand mimicry.** You will not upload references with the intent to clone another brand's identity, trade dress, packaging, logo, mascot, or recognisable campaign in a way that would mislead consumers or breach trademark, passing-off, or unfair-competition law.
- **No private property or persons captured in scenes.** Reference images depicting identifiable people, private interiors, or restricted locations must respect the same consent and rights rules as §10 (no minors, no public figures without rights, no NCII, no surveillance / paparazzi material).
- **No prohibited content as reference.** You will not upload references that are illegal, sexual, violent, hateful, or otherwise prohibited under §9.
- **Enforcement.** We may, at our sole discretion and without refund, block, remove, refuse to generate from, suspend, or terminate any account, and report to rights-holders or authorities, any reference upload or resulting Generation that appears to violate this section. We may also comply with DMCA / EU DSA takedown notices targeting reference uploads or their Generations.
- **Indemnity.** You fully indemnify, defend, and hold harmless VOVV.AI, MB 123PRESETS, and its operators against any claim, fine, regulatory action, or damages — including copyright infringement (US DMCA, EU Copyright Directive, UK CDPA), trademark / trade-dress, passing-off, unfair competition, right-of-publicity, defamation, and EU AI Act Art. 50 — arising from any reference image you uploaded or any Generation derived from it.
- **Carve-out from liability cap.** The cap in the renumbered Limitation of Liability section does not apply to amounts you owe under this indemnity.

## 2. Tighten existing §9 Acceptable Use

Add one bullet so reference uploads are also called out at the top level:

- Upload reference, mood-board, or scene images that you do not own or have a clear licence to use as an AI reference, or that mimic another brand's identity in a misleading way (see §11)

## 3. Renumber downstream sections

Current §11–§25 become §12–§26. Update the §18 → §19 cross-reference inside the §10 indemnity carve-out, and add a matching carve-out reference inside the new §11. Privacy Policy gets a one-line note under the existing "Biometric & Likeness Data" subsection clarifying that **reference images** are processed only to generate the visual you requested, are not used for AI training, and follow the same retention rules.

## 4. No UI / flow / DB changes

- Signup keeps its single existing "I agree to the Terms of Service and Privacy Policy" checkbox.
- Brand Scenes upload UI is unchanged in this pass.
- No migration, no audit log, no version constant — purely a legal-copy update.

## Files to edit

- `src/components/legal/TermsContent.tsx` — add §11, tighten §9 bullet list, renumber §11–§25 to §12–§26, fix §18 reference.
- `src/components/legal/PrivacyContent.tsx` — append one sentence under the existing Biometric & Likeness Data subsection.

## Out of scope

- Re-prompting existing users to re-accept.
- In-flow consent dialog inside the Brand Scenes upload step (recommended follow-up).
- Translations.
- Automated copyright / NSFW scanning of uploaded references.
