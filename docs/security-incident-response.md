# Security incident response process

Internal runbook. Yield currently has one responsible individual (Sakithiyan Selvakumar), so this process is written for a single operator — no handoff steps, but the timeline is real and must be honoured.

## If a security risk or breach is reported or discovered

**0. Triage immediately.** A report can arrive via `support@yield-mtd.co.uk` or `/.well-known/security.txt`. Read it the same day. Confirm whether it affects personal or customer data (names, emails, NI numbers, HMRC OAuth tokens, property/transaction data, Stripe customer IDs).

**1. Contain.** Depending on the issue:
   - Revoke/rotate affected credentials (Supabase service role key, HMRC/Xero OAuth client secret, Stripe API keys) via their respective dashboards.
   - If a specific user's HMRC or Xero tokens are compromised, delete the row in `hmrc_connections` / `xero_connections` for that user via Supabase to force re-authorisation.
   - If the vulnerability is in deployed code, ship a fix and deploy immediately (`git push` — auto-deploys to Vercel production).

**2. Notify HMRC within 72 hours of becoming aware of the breach**, if it involves personal or customer data:
   - Log a ticket via the HMRC Developer Hub support ticket system: https://developer.service.hmrc.gov.uk (Support > report an issue).
   - Provide: breach contact name (Sakithiyan Selvakumar), phone number, a description of the breach, what data was affected, and remediation steps already taken.

**3. Notify the ICO within 72 hours of becoming aware**, if the breach is likely to risk people's rights and freedoms:
   - Report via https://ico.org.uk/for-organisations/report-a-breach/
   - Same details as above, plus estimated number of affected individuals.

**4. Notify affected users directly** if there's a high risk to their rights/freedoms (per UK GDPR Art. 34), via email, explaining what happened and what they should do (e.g. re-authorise HMRC/Xero, check for suspicious activity).

**5. Post-incident.** Write a short internal note: what happened, root cause, what was fixed, what would prevent recurrence. Update this runbook if the process needs to change.

## Key contacts / links
- Breach contact: Sakithiyan Selvakumar — support@yield-mtd.co.uk
- HMRC Developer Hub support: https://developer.service.hmrc.gov.uk
- ICO breach reporting: https://ico.org.uk/for-organisations/report-a-breach/
- Supabase project: https://supabase.com/dashboard (project ref: oqzhxxprhmnmdshtxrua)
- Vercel project: https://vercel.com/sakithiyan23-9367s-projects/yield
