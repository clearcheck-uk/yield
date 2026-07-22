# Security controls audit — Yield

Date: 2026-07-22
Mapped against the ICO's information security checklist categories for small organisations.

## Risk assessment
- Data mapped in privacy policy (`src/app/privacy/page.tsx`, section 2): NI number, HMRC OAuth tokens, property/transaction data are the highest-risk fields.
- Reviewed against OWASP Top 10 / API Security Top 10 as part of this audit (see penetration testing below).

## Access control
- Every table has Row Level Security scoped to `auth.uid() = user_id` (`supabase/schema.sql`).
- Every API route independently authenticates via Supabase JWT and scopes all reads/writes to the authenticated user's own ID (re-audited across all 12 API routes — see `docs/security-incident-response.md` context).
- No employees/staff with system access — solo operator (see privacy policy, "who we are").

## Encryption
- In transit: TLS/HSTS enforced on all connections (Supabase, HMRC, Xero, Stripe).
- At rest: Supabase/AWS platform-level AES-256 (default) plus application-level AES-256-GCM field encryption on the highest-sensitivity columns — HMRC/Xero access & refresh tokens, NI number (`src/lib/crypto.ts`).

## Testing
- OWASP ZAP baseline penetration test run against production, following NCSC Penetration Guide methodology. Found and fixed: missing CSP header, broken object-level authorization on the submission endpoint. Final result: 0 failures, 63 passes. Reports in `pentest-reports/`.
- WCAG 2.1 AA accessibility audit (axe-core): 0 violations across all public pages after fixes.
- npm dependency audit run; the one fixable finding (brace-expansion) patched.

## Incident response
- Documented runbook (`docs/security-incident-response.md`): breach containment steps, 72-hour HMRC ticket + ICO notification process, affected-user notification, post-incident review.
- Security disclosure channel: `/.well-known/security.txt` + privacy policy mention.

## Data minimisation & retention
- Only data required to file MTD returns is collected (privacy policy, section 2).
- 7-year retention aligned to HMRC record-keeping requirements, with data deletion available on request (privacy policy, sections 6-7).

## Data portability
- Self-service export (`/api/account/export`) — see privacy policy section 7.

## Third-party/supplier risk
- Sub-processors documented in privacy policy (section 9): HMRC, Xero, Stripe, Supabase, Vercel. All established providers with their own security/compliance programmes (Stripe is PCI-DSS Level 1; Supabase/Vercel run on AWS infrastructure).

## Backups & continuity
- Handled by Supabase's managed Postgres (automated backups) — not independently verified as part of this audit; worth confirming backup retention/restore process directly with Supabase if this becomes business-critical.

## Not applicable
- Physical security: no on-premises infrastructure — entirely managed cloud (Vercel, Supabase).
- Staff training: solo operator, no employees.
