

## Update Selfie / UGC Set Description

### Change

Update the workflow description in the database from the current casual/phone-camera copy to a more professional, results-focused message.

**Current:**
> Casual phone-camera style shots -- mirror selfies, coffee shops, golden-hour parks. Authentic UGC aesthetic that converts on social.

**New:**
> High-quality content like top creators -- your product plus model, generating super professional results in seconds.

### Technical Detail

Run a database migration to update the `description` column for the "Selfie / UGC Set" workflow (id: `3b54d43a-a03a-49a6-a64e-bf2dd999abc8`).

No frontend code changes needed -- the WorkflowCard already renders `workflow.description` from the database.

