# TODO - Correct payment flow

## Plan
1. Make a single canonical payment callback handler (use `app/api/pesapal/callback/route.ts`).
2. Remove/disable the unsafe/manual completion endpoint in `app/api/payments/route.ts` (POST that sets `payment.status='completed'` with `simulated_...`).
3. Remove/disable the redundant redirect callback in `app/api/payments/callback/route.ts` (GET + POST) to avoid conflicting status transitions.
4. Fix the success/failed UI so it reflects DB-verified status (optionally re-check via API in `app/checkout/success/page.tsx` and `app/checkout/failed/page.tsx`).
5. Ensure initiation (`app/api/payments/initiate/route.ts`) stores payment/orderTrackingId consistently with what the callback expects.
6. Add idempotency/guards in callback updates (do not re-confirm already completed payments; handle propertyRequest payments too).

## Progress
- [ ] Steps 1-2 identified but not implemented
- [ ] Steps 3-6 identified but not implemented

