# TODO
- [ ] Add `imageUrl` field to Prisma `SitePage` model and migrate.
- [ ] Update `app/api/admin/site-pages/route.ts` to accept/store `imageUrl` and validate inputs.
- [ ] Update blog/news public pages and homepage `NewsBlogSection` to use `imageUrl` instead of placeholders.
- [ ] Add Cloudinary upload widget + imageUrl field in `app/admin/blog/page.tsx` and `app/admin/news/page.tsx` forms.
- [ ] Remove editor “default slug” workflow by auto-generating unique slugs based on title (and ensure uniqueness with `SitePage.slug @unique`).
- [ ] Ensure `/blog/[slug]` and `/news/[slug]` still work with new slug generation.
- [ ] Update any missing TypeScript interfaces/types.
- [ ] Run typecheck/lint and verify build.

