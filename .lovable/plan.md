# Terms of Service: typography fix + polish pass

## The "strange §" problem

The Terms currently use the silcrow character "§" inline (e.g. "see §10", "§19 (Limitation of Liability)"). In the signup modal at typical body sizes it renders as a glyph many users don't recognise and visually clashes with our minimal Inter typography. Two things to fix:

1. Replace every inline "§N" cross-reference with the word **"Section N"** (e.g. "see Section 10"). Clearer, more professional, reads cleanly at any size.
2. Fix a stale cross-reference: the Survival clause points to "§26 (Governing Law)" but Governing Law is now Section 25 after the last renumber.

No section headings change — they already read "10. Face, Likeness…", not "§10".

## Polish pass to make Terms "super good"

Several early sections are currently one-liners that feel thin next to the heavyweight clauses (10, 11, 15, 16). Expand them to proper, defensible language without bloating the document. Targets:

- **5. Service Description** — clarify VOVV is a tool/processor, not a publisher; outputs are user-directed.
- **6. Experimental Features (Beta)** — add "no SLA, may be withdrawn, no liability for beta-only defects".
- **7. Availability** — add planned maintenance, no SLA unless separately agreed, best-effort uptime.
- **12. Your Responsibility** — tighten publisher/controller language and add "you are the controller for any personal data in your Inputs".
- **13. AI Limitations** — add hallucination/inaccuracy disclaimer, no fitness for a particular purpose, mandatory human review before publication.
- **14. AI Transparency (EU AI Act)** — name Art. 50 obligations, watermarking/labelling duty for deepfakes, deceptive-content ban.
- **17. Third-Party Services** — list categories (cloud, payment, AI model providers, email, analytics), note their terms may apply.
- **18. Indemnification** — full defend/hold-harmless language, cooperation clause, sole control of defence.
- **19. Limitation of Liability** — keep 12-month cap, add standard exclusions (gross negligence, wilful misconduct, death/personal injury, fraud, statutory consumer rights) so the cap holds up in the EU/UK.
- **20. Disclaimer** — full "AS IS / AS AVAILABLE", no implied warranties of merchantability, fitness, non-infringement, accuracy.
- **21. Copyright & Content Complaints** — proper DMCA-style notice contents (identification, good-faith statement, signature, contact), counter-notice, repeat-infringer policy.
- **22. DSA Compliance (EU)** — add Single Point of Contact email, trusted-flagger language, statement of reasons, internal complaints handling.
- **23. Termination** — add grounds (breach, non-payment, legal risk), effect of termination (access ends, data per Section 15 backup rule), no refund for cause.
- **25. Governing Law** — add venue (Lithuanian courts for business users), keep EU consumer carve-out, add severability + entire-agreement micro-clauses or move them to a new Section 26 "General".
- **26. Changes** — add notice mechanism (email or in-app), 30-day notice for material changes, continued use = acceptance.
- Add a small **Section 27 "General"** (assignment, no waiver, severability, entire agreement, notices, language) before Company Information, then renumber Company Information to **28**.

## Cross-references after renumber

After adding "General" as Section 27 and pushing Company Information to 28, audit every "Section N" reference and the Survival list so they still point to the right targets. Update Privacy Policy cross-references only if a Privacy section number actually moved (it doesn't here).

## Scope

- Single file edit: `src/components/legal/TermsContent.tsx`.
- Pure presentational copy changes. No UI components, routes, DB, auth, translations, or business logic.
- Bump `public/version.json` patch so cached clients pick up the new copy.

## Out of scope

- Privacy Policy rewrite (already strong; only touch if a referenced number moves).
- New legal frameworks beyond what's already covered (GDPR, AI Act Art. 50, DSA, DMCA, Data Act, TAKE IT DOWN, Online Safety Act).
- Any change to the single signup-time Terms checkbox or acceptance flow.
