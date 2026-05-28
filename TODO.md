# TODO

- [ ] Patch `lib/rbac.ts` so `requireAdmin()` can use Clerk-admin list (`NEXT_PUBLIC_ADMIN_CLERK_IDS`) instead of relying solely on `prisma.user.role`.
- [ ] Optionally keep DB role as fallback for safety.
- [ ] Run `npm test` / `npm run lint` / `npm run build` (whichever exists) to ensure no TS/ESLint errors.

