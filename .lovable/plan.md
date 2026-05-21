# Close coverage gaps vs Kive (kive.ai/terms)

Side-by-side review of our Terms against Kive's. We are **stronger** than Kive on safety (face / biometrics, AI Act Art. 50, DSA, NCII, TAKE IT DOWN Act, minors, brand mimicry, 14-day EU withdrawal). Kive is **stronger** on a handful of standard commercial / IP / EU compliance clauses that we should add to be on par.

## Where we already match or beat Kive

- Acceptable Use, no-deepfake / no-illegal content — covered in our §9.
- Biometric / likeness uploads — our §10 is more specific (GDPR Art. 9, consent, indemnity carve-out). Kive has none of this.
- Scene / reference uploads — our §11 explicitly covers brand mimicry. Kive only has a generic IP clause.
- AI output disclaimer ("may contain errors, may resemble existing content, not unique or lawful") — our §13. Kive §5 says the same.
- AI transparency / EU AI Act Art. 50 — our §14. Kive has nothing.
- DSA, DMCA contact, copyright complaints — our §21–§22. Kive has DMCA only.
- 14-day EU withdrawal — our §8. Kive does not address it.
- Limitation of liability, 12-month cap — our §19. Matches Kive §8.
- Indemnification — our §18. Matches Kive §8.

## Gaps to add

### 1. Authorized Users / team accounts — extend §4 (Account Responsibility)

Add a short paragraph: if your subscription includes additional seats, you may grant access to employees or other authorized users; you remain liable for all activity by those users; you must notify us immediately of any unauthorized access. Mirrors Kive §2 "Authorized Users".

### 2. Limited operational licence — extend §15 (Intellectual Property)

We say "you own Inputs and Generations" but never grant ourselves the licence we technically need to run the Service. Add:

- You grant VOVV.AI a worldwide, non-exclusive, royalty-free licence to host, process, transmit, modify, copy, store, and create derivative works of your Inputs and Generations solely to operate, secure, support, and improve the Service for you.
- Where you choose to share Generations publicly, with collaborators, or to a team workspace, this licence extends to enabling that sharing.
- The licence terminates when you delete the content or close your account, subject to backups and legal-retention exceptions in the Privacy Policy.

### 3. Service data (aggregated / anonymised) — new short clause inside §15

We own all aggregated, anonymised usage data, logs, performance metrics, and model-quality insights derived from operation of the Service, and may use them to operate and improve the Service. We do not disclose your Inputs, Generations, or personal data to third parties in non-anonymised form except as described in the Privacy Policy. Mirrors Kive §5 "Service data".

### 4. Feedback assignment — new short clause inside §15

Any feedback, ideas, or suggestions you send us are non-confidential; you assign all rights in them to VOVV.AI and we may use them without restriction or attribution. Mirrors Kive §5 "Feedback".

### 5. Subscription term & auto-renewal — extend §8 (Credits and Payments)

Add explicit auto-renewal language: monthly subscriptions renew monthly, annual subscriptions renew annually, until cancelled in account settings before the end of the current period; cancellation takes effect at the end of the current paid period; price changes apply to the next renewal after notice. Kive §6 is the model.

### 6. EU Data Act portability — new §X under "Your Rights / Data"

Add a short clause for EU/EEA customers under Regulation (EU) 2023/2854 (Data Act): right to request transfer of your data to another provider or deletion at any time on two months' written notice, with reasonable assistance from us, subject to recovery of direct costs to the extent permitted by the Data Act. Mirrors Kive §7.

### 7. Force majeure — new clause inside §17 (Third-Party Services) or as its own short section

We are not liable for failures, delays, or defects caused by events outside our reasonable control (third-party outages, infrastructure failures, government action, war, natural disasters, etc.). We will notify you as soon as practicable and take reasonable steps to minimise impact. Mirrors Kive §9.

### 8. Confidentiality — strengthen §16

Our current §16 is one sentence. Replace with a mutual clause: each party will treat the other's non-public information as confidential, will use it only to perform under these Terms, and will not disclose it to third parties without consent except as required by law or to subprocessors bound by equivalent confidentiality. Survives termination for two years (trade secrets indefinitely). Mirrors Kive §9.

### 9. Survival — new short clause in §23 (Termination)

Sections that by their nature should survive — IP, confidentiality, indemnification, limitation of liability, governing law — survive termination. One sentence. Mirrors Kive §7.

### 10. Backup retention after deletion — extend §15 (or add to Privacy)

When you delete content or your account, we may retain copies for a reasonable period for backup, audit, fraud-prevention, and legal-compliance purposes, after which they are permanently deleted. Already partly in Privacy §10 — add an explicit cross-reference in Terms.

## Things we will NOT copy from Kive

- Swedish law / Stockholm SCC arbitration — we keep Delaware + EU local-consumer-rights split (our §24).
- "Use Inputs to train AI" — we already promise the opposite in Privacy §8 and we will keep it that way (this is a marketing differentiator vs Kive).
- Kive's vague "share to public boards" licence — we don't have public boards, so not relevant.

## Files to edit

- `src/components/legal/TermsContent.tsx` — sections §4, §8, §15, §16, §17, §23, plus one new section for EU Data Act (insert before Governing Law and renumber downstream by +1).
- `src/components/legal/PrivacyContent.tsx` — one-line backup-retention cross-reference if needed.

No UI, no DB, no auth changes. Single Terms checkbox at signup keeps covering everything.

## Out of scope

- Re-prompting existing users to re-accept.
- Translations.
- Changing governing law or arbitration venue.
- Adding a separate Acceptable Use Guidelines document (Kive splits theirs; we keep one consolidated Terms).
