# Fraud prevention headers — validation record

Date: 2026-07-22
Validated against HMRC's real Test Fraud Prevention Headers API (`txm-fph-validator-api` v1.0), sandbox: `GET https://test-api.service.hmrc.gov.uk/test/fraud-prevention-headers/validate`, application-restricted OAuth (client credentials).

## Result

`code: POTENTIALLY_INVALID_HEADERS` (not `INVALID_HEADERS` — these are soft warnings, not failures) with 2 warnings:

1. **`gov-client-multi-factor` — MISSING_HEADER.** Expected: Yield only implements single-factor authentication (Supabase email + password; the signup OTP is one-time email verification, not a login-time MFA factor). HMRC's own validator message: *"This may be correct for single factor authentication... If this is the case, you must contact us explaining why you cannot submit this header."*

2. **`gov-vendor-license-ids` — EMPTY_HEADER** (sent as `''`). Expected: Yield is a plain subscription web SaaS with no per-device software license key system, so there's no value to hash and send. HMRC's documented convention (per their fraud prevention guides) is to send this header empty when genuinely inapplicable, rather than omit it — tested both ways against the live validator; omitting it produces a `MISSING_HEADER` warning instead, which is less clearly "handled" than an explicit empty value.

## Action required

Both of these are legitimate "not applicable" cases, not bugs — but HMRC's own guidance says you must proactively tell them, not just leave the validator warning unaddressed. **Before/when resubmitting**, email `softwaredevelopersupport@service.hmrc.gov.uk` (or note it in the resubmission ticket) briefly explaining:
- Yield uses single-factor authentication only (no MFA), hence no `Gov-Client-Multi-Factor` value.
- Yield has no per-device license key system (subscription SaaS), hence `Gov-Vendor-License-IDs` is sent empty.

## All other headers: valid

Every other `Gov-Client-*`/`Gov-Vendor-*` header (connection method, device ID, timezone, public IP, browser user-agent, vendor version, vendor product name, vendor forwarded, etc.) passed validation with no warnings or errors.
