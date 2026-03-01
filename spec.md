# Asistenku Landing Page

## Current State
Full-stack app with landing page, portal internal, dashboard admin, dashboard partner, dashboard asistenmu, dashboard client, client login/register, portal partner. Backend has full user/partner/client/service/task/withdraw/financial management with stable vars.

## Requested Changes (Diff)

### Add
- New page `/claim-admin-as`: a minimal page (no Header/Footer) with only a Claim Admin card centered on the page.
- Access restricted to exactly 2 principals:
  - `fjkli-fsbma-6it5u-allin-kv6rp-v6j7f-bayef-3iut6-bd3td-2corr-gqe` (live)
  - `mu7go-gesml-ultdd-tqrkp-465oz-ticdh-ir6fg-6i6yq-qfn7i-pqaft-mqe` (draft)
- Any other principal sees "Akses ditolak" message.
- New backend function `claimAdminOverride`: same as `claimAdmin` but can override existing admin. Removes any existing admin user from users map, resets adminClaimed, then inserts new admin with caller's principalId, nama="Admin Asistenku", email="admasistenku@gmail.com", whatsapp="08817743613", role=#admin, status=#active. Only callable by the 2 allowed principals (checked on-chain).

### Modify
- App router: add `/claim-admin-as` route.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `claimAdminOverride` to backend (checks caller against 2 allowed principals, overrides existing admin, saves to stable var).
2. Create `ClaimAdminAs.tsx` page: login II required, check principal on frontend before showing card, call `claimAdminOverride` on click, show success/denied message.
3. Add route `/claim-admin-as` in App.tsx.
