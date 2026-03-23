

# Legal Gap Analysis: VOVV.AI vs Veeton Terms & Privacy

## Summary

Veeton's ToS is a **B2B enterprise contract** (French law, SAS company) while yours is a **B2C SaaS agreement** (Delaware law). Many of Veeton's clauses are B2B-specific and not directly applicable to your model. However, several areas in their agreement reveal gaps in yours worth addressing.

---

## Terms of Service — What VOVV.AI Is Missing

### 1. Formal Definitions Section
**Veeton has it / You don't.** They define "Generated Assets", "Inputs", "Client's Data", "Usage Data", "Confidential Information", etc. upfront. Your ToS uses terms like "Generations" and "Service" but doesn't have a dedicated definitions block. A definitions section reduces ambiguity and strengthens enforceability.

### 2. Confidentiality Clause
**Veeton has it / You don't.** Veeton includes a full confidentiality article (obligations, duration of 3 years post-termination, exceptions). Your ToS has no confidentiality provisions. This matters if enterprise clients share proprietary product images.

### 3. GDPR / Data Processor vs Controller Framework
**Veeton has it / You don't.** Veeton explicitly defines themselves as "data processor" and the client as "data controller" per GDPR, with detailed sub-processor obligations, data retention periods, breach notification procedures, and cross-border transfer safeguards. Your privacy policy mentions "encryption" and "security measures" but has zero GDPR-specific language — no lawful basis for processing, no data processor/controller distinction, no DPA (Data Processing Agreement) provisions. **This is your biggest gap** if you serve EU customers.

### 4. Force Majeure
**Veeton has it / You don't.** They include a force majeure clause (15-day notification, 3-month suspension, then termination rights). Your ToS has no force majeure provision. Standard for SaaS agreements.

### 5. Service Availability / SLA Expectations
**Veeton has it / You don't.** Veeton explicitly states they make "no guarantees regarding quality, stability, uptime, or reliability" and advises clients "not to create dependencies on specific attributes." Your ToS mentions the service is provided "as is" but doesn't address uptime, maintenance windows, or service modifications.

### 6. Subcontractor / Third-Party Disclosure
**Veeton has it / You don't.** Veeton discloses they may use subcontractors and third-party AI models. Your ToS doesn't mention third-party AI providers (like the image generation APIs you actually use), which could be a transparency issue.

### 7. Insurance Clause
**Veeton has it / You don't.** B2B-specific but worth noting — Veeton requires both parties to maintain insurance. Less relevant for B2C but could matter for enterprise plans.

### 8. Non-Disparagement
**Veeton has it / You don't.** Minor but present in their agreement.

### 9. Communication / Logo Usage Rights
**Veeton has it / You don't.** Veeton reserves the right to use client logos in marketing. You could add a clause allowing you to feature client brands/testimonials.

### 10. Electronic Signature / Document Validity
**Veeton has it / You don't.** Veeton explicitly states electronic documents have full legal validity.

---

## Terms of Service — What VOVV.AI Has That Veeton Doesn't

Your ToS is actually **stronger** in several areas:

- **AI-Generated IP Status** (Section 9) — Explicitly addresses the unsettled legal status of AI-generated content copyrightability. Veeton doesn't touch this.
- **DMCA Takedown Process** (Section 13) — Full DMCA procedure. Veeton has nothing on this.
- **Deepfake / Likeness Protections** (Section 5) — Explicit prohibition on deepfakes and recognizable likenesses without consent. Veeton's acceptable use is more generic.
- **Credit System Terms** (Section 4) — Clear credit/refund terms. Veeton's payment terms are in separate Commercial Offers.

---

## Privacy Policy — Key Gaps

### Your Privacy Policy is Missing:

| Gap | What Veeton/Best Practice Covers | Your Current State |
|-----|----------------------------------|-------------------|
| **GDPR Lawful Basis** | Specifies legal basis for each processing activity | Not mentioned |
| **Data Processor/Controller** | Explicit GDPR roles defined | Not mentioned |
| **Sub-processor List** | Obligation to disclose and get consent for sub-processors | Not mentioned |
| **Data Breach Notification** | 72-hour notification procedure per GDPR | Not mentioned |
| **Cross-Border Transfers** | Safeguards for EU data transferred outside EEA | Not mentioned |
| **Data Processing Agreement** | Standard contractual clauses for enterprise clients | Not available |
| **Specific Data Categories** | Lists exact data types (email, IP, browser, etc.) | Partially covered |
| **Retention Periods per Data Type** | How long each category is kept | Only says "while account active" |
| **Right to Lodge Complaint** | Right to complain to supervisory authority (GDPR Art 77) | Not mentioned |
| **Legal Basis for Marketing** | Consent vs legitimate interest for communications | Not mentioned |
| **Age Restrictions** | Minimum age for using the service | Not mentioned |
| **Automated Decision-Making** | GDPR Art 22 — profiling and automated decisions | Not mentioned |

---

## Recommended Priority Actions

1. **Add GDPR section to Privacy Policy** — Lawful basis, data processor/controller, breach notification, cross-border transfers, right to lodge complaint. Critical if serving any EU users.
2. **Add Definitions section to ToS** — Formally define "Inputs", "Generations", "Service", "Credits", "Account Data".
3. **Add Force Majeure clause to ToS** — Standard SaaS protection.
4. **Add Third-Party Service Providers disclosure** — Mention that you use third-party AI and cloud infrastructure providers.
5. **Add Data Retention schedule** — Specify retention periods per data category.
6. **Add Age Restriction** — Minimum age (typically 16 for GDPR, 13 for COPPA).
7. **Add Confidentiality clause** — Especially relevant for enterprise/team plans.
8. **Remove "template" disclaimer** — Both your ToS and Privacy Policy currently say "This is a template... consult a legal professional." This undermines the enforceability of your own terms. Remove it or replace with proper legal review.

---

## Note
This is a competitive analysis, not legal advice. Consult a qualified attorney before making changes to your legal documents, especially regarding GDPR compliance.

