# Terms of Service — close commercial / IP / EU gaps (items 2–10)

Adds the standard commercial, IP, and EU-compliance clauses we were missing versus Kive. Safety clauses (face, scenes, AI Act, DSA, NCII) stay as-is — they are already stronger than the competition. No UI, no DB, no auth changes.

## Section-by-section changes in `src/components/legal/TermsContent.tsx`

### §8 Credits and Payments — add Subscription Term & Auto-Renewal subsection

Append below the existing bullets:

- Subscriptions renew automatically at the end of each billing period (monthly plans renew monthly, annual plans renew annually) at the then-current price using the payment method on file, until cancelled.
- You can cancel at any time from account settings. Cancellation takes effect at the end of the current paid period; you keep access until then.
- Price changes apply to the next renewal after we have given you reasonable advance notice (at least 30 days for material increases). Continued use after the new price takes effect is acceptance of the new price.
- Credits and add-ons remain non-refundable except where required by law.

### §15 Intellectual Property — replace with expanded section

Keep the three existing bullets ("You retain ownership of Inputs", "You own Generations", "VOVV.AI owns all platform technology") and add four named subsections beneath them:

- **Limited operational licence.** You grant VOVV.AI a worldwide, non-exclusive, royalty-free licence to host, store, transmit, process, modify, copy, display, and create derivative works of your Inputs and Generations solely to operate, secure, support, and improve the Service for you, and — where you choose to share — to enable sharing with collaborators, team members, or public destinations you select. The licence terminates when you delete the content or close your account, subject to the backup-retention clause below.
- **Service data.** All aggregated, anonymised, or de-identified usage data, logs, performance metrics, and model-quality insights derived from operation of the Service are owned by VOVV.AI and may be used to operate, secure, and improve the Service. We do not disclose your Inputs, Generations, or personal data to third parties in non-anonymised form except as described in the Privacy Policy.
- **Feedback.** Ideas, suggestions, or feedback you send us are non-confidential. You assign all rights in such feedback to VOVV.AI, and we may use it without restriction, compensation, or attribution.
- **Backup retention after deletion.** When you delete content or your account, we may retain copies for a reasonable period (typically up to 30 days, longer where required by law) for backup, audit, fraud-prevention, and legal-compliance purposes, after which they are permanently deleted. See Privacy Policy §10 for full retention rules.

### §16 Confidentiality — replace with mutual clause

Replace the current one-sentence section with:

- Each party will treat the other party's non-public information disclosed under or in connection with these Terms as confidential, use it only to perform under these Terms, and not disclose it to third parties without consent except (a) as required by law or regulator, or (b) to employees, contractors, or subprocessors bound by equivalent confidentiality obligations.
- Confidentiality obligations survive termination for two (2) years; trade secrets are protected for as long as they qualify as such under applicable law.
- We treat your Inputs and Generations as confidential and do not use them to train AI models.

### §17 Third-Party Services — add Force Majeure subsection

Keep the existing one-sentence content and add:

- **Force majeure.** We are not liable for any failure, delay, or defect in performance caused by events outside our reasonable control, including outages or failures of third-party infrastructure or AI providers, internet or network failures, acts of government, war, terrorism, civil unrest, strikes, pandemics, or natural disasters. We will notify you as soon as practicable and take reasonable steps to minimise impact. If a force-majeure event materially prevents performance for more than 30 consecutive days, either party may terminate the affected subscription and we will refund any prepaid, unused fees on a pro-rata basis.

### New §24 — Data Portability & Deletion (EU Data Act)

Insert a new section between current §23 (Governing Law, will become §25) and the renumbered downstream sections. Renumber the four current sections §23–§26 to §25–§28.

- If you are established in the EU/EEA or otherwise subject to Regulation (EU) 2023/2854 (the **Data Act**), you may at any time, on at least two months' written notice to <a href="mailto:hello@vovv.ai">hello@vovv.ai</a>, request (a) the transfer of your data to another provider in a structured, commonly used, and machine-readable format, or (b) the deletion of your data.
- We will provide reasonable assistance to support transfer or deletion. We may charge reasonable direct costs to the extent permitted by the Data Act and will provide an itemised invoice.
- This right is in addition to your data-subject rights under the GDPR (see Privacy Policy §13) and does not affect any other contractual or statutory rights.

### §23 Termination (renumbered to §25 after the Data Act insertion) — add Survival subsection

Keep the existing sentence and add:

- **Survival.** Provisions that by their nature should survive termination — including §10 (Face, Likeness & Biometric Uploads), §11 (Scene & Reference Image Uploads), §15 (Intellectual Property), §16 (Confidentiality), §18 (Indemnification), §19 (Limitation of Liability), §20 (Disclaimer), and §26 (Governing Law) — survive termination of your account or these Terms.

### Renumbering summary

Current → new after inserting Data Act between current §23 and §24:

| Current | New | Title |
|---|---|---|
| §1–§22 | §1–§22 | unchanged |
| §23 | §23 | Termination (+ Survival subsection) |
| — | §24 | Data Portability & Deletion (EU Data Act) — **new** |
| §24 | §25 | Governing Law |
| §25 | §26 | Changes |
| §26 | §27 | Company Information |

All internal cross-references (currently to §18 Indemnification and §19 Limitation of Liability inside §10 and §11) stay correct because nothing before §24 changes number. The new Survival list uses the renumbered §26 for Governing Law.

## Privacy Policy

No changes needed. The existing §10 (Data Retention) already states the 30-day-after-deletion rule and is cross-referenced from the new Terms §15 "Backup retention" subsection.

## Technical details

- Single file edited: `src/components/legal/TermsContent.tsx`.
- Content-only changes; existing prose styles (`.prose`) handle formatting.
- Use `<h2>` for new section headers, `<h3>` for named subsections inside §8, §15, §16, §17, and §23, matching the file's existing style hooks.
- Keep British/US spelling consistent with the surrounding file ("licence" in IP context, otherwise current spellings).

## Out of scope

- Re-prompting existing users to re-accept.
- Translations.
- Changing governing law, arbitration venue, or the consolidated single-document structure.
- Signup UI changes — the existing single Terms checkbox keeps covering all of this.
