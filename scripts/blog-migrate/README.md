# Blog migration (WordPress → Next.js)

Moves the WordPress blog at `/blog` into this app (`app/(pages)/blog`, admin at `/admin/blog`).
Content lives in MongoDB (`scholarly_help.blog_*`), images in Cloudinary.

## Run the migration

```bash
# Preview only: converts every post and writes a report, no uploads, no DB writes
npx vite-node -c vitest.config.ts scripts/blog-migrate/migrate.ts -- --dry-run

# Real run (DB from DATABASE_URL, images to BLOG_CLOUDINARY_FOLDER, default scholarlyhelp/blog)
npx vite-node -c vitest.config.ts scripts/blog-migrate/migrate.ts -- --settings
```

Options: `--dry-run`, `--no-images` (keep WordPress image URLs), `--only=slug-a,slug-b`,
`--settings` (re-import the blog index header), `--report=FILE` (default `blog-migration-report.md`).

It is safe to run repeatedly. Posts are matched by WordPress id, categories and tags by slug, and
uploaded images are cached in `blog_migration_images`, so a re-run updates content instead of
duplicating it (view counts never go down). Run it once more right before switchover to pick up
any last WordPress edits.

What it reads:
- WordPress REST API: posts, categories, tags, featured images, Yoast SEO fields
- Each post's public page: header video and CTA, body sections, feature cards, CTAs, link cards,
  FAQ, closing CTA, author and view count (these come from Elementor template fields the API
  doesn't expose)

Template parts (edited once in Admin → Blog → Settings, not per post):
- The "95% Success Rate / 10K+ Students…" stats strip becomes a "Stats strip" block at the same spot
- The "Need Professional Help with Your Research?" box is shown at the end of every article
  (on WordPress its buttons linked to `#`; the new defaults are `/order/` and `/academic-research/`)

View counts: WordPress's counter started every post near 10,000, so its numbers are stored as
`importedViews` and only added to the public "Total Views" figure. The admin shows real views,
counted from zero (one per visitor session; signed-in admins and bots are not counted). Re-running
the migration never overwrites real views.

Comments are off by default; turn them on in Admin → Blog → Settings.

Reported in the migration report:
- CTA buttons that have no link on WordPress (the heading/text is kept, the button is dropped)

## Switchover checklist (production)

1. Deploy the branch to production. Until nginx changes, `/blog` still serves WordPress, so the
   new blog is only reachable through the admin. (`/blog/post-sitemap.xml` is also routed to
   WordPress until step 4, so merge the `robots.txt` line at switchover time.)
2. Freeze edits in WordPress.
3. Run the migration against the production database with `BLOG_CLOUDINARY_FOLDER=scholarlyhelp/blog`.
   Check the report: 0 failures, word coverage above 85%.
4. On the EC2 server, in `/etc/nginx/sites-enabled/scholarlyhelp.com`, replace the
   `location /blog { … php … }` block with:

   ```nginx
   # Old WordPress image URLs keep working (Google Images, external links)
   location ^~ /blog/wp-content/uploads/ {
       root /var/www/html;
       expires 30d;
   }
   # Everything else under /blog goes to Next.js via `location /`
   ```

   Then `sudo nginx -t && sudo systemctl reload nginx`, and invalidate `/blog*` in CloudFront.
5. Verify: every old URL returns 200 or a redirect (posts, categories, tags, `/blog/page/N/`,
   `/blog/author/cutredblackfox/`, Yoast sitemaps). Submit `https://scholarlyhelp.com/blog/post-sitemap.xml`
   in Google Search Console.
6. Rollback: restore the old `location /blog` block and reload nginx. Keep WordPress
   untouched for 30 days before removing it.
