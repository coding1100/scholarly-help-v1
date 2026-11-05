# Scholarly Help Frontend

Next.js frontend for the Scholarly Help marketing site, AI tools, order flow, and admin CMS. The app is structured around route groups and a Mongo-backed content layer rather than a classic API-first SPA.

## Stack

- Next.js 14 with App Router
- React 18 + TypeScript
- Tailwind CSS
- MongoDB via native driver
- Stripe, JWT auth, Google services, Tiptap
- Hosted on EC2 with PM2 in production

## App shape

- `app/(pages)/` : public pages, landing pages, tool pages, order and marketing routes
- `app/(admin)/` : authenticated admin dashboard and CMS screens
- `app/components/` : reusable UI, landing-page blocks, tool UI, forms, shared sections
- `app/lib/` : database helpers, route config, admin navigation utilities
- `app/context/` : global providers such as auth
- `app/data/` : static content/config JSON
- `public/` : images, fonts, static assets

The homepage loads CMS-style content from MongoDB through `getHomeData()` in `app/lib/mongodb.ts`, with a short cache window. That is the main pattern for marketing content.

## Key frontend behaviors

- Legacy URLs are redirected in `next.config.js` to the new `/tools/...` structure.
- The app has separate public and admin route groups, with admin auth checked through `/api/admin/session`.
- Dynamic landing pages and page content are routed through the admin CMS and rendered from app data rather than only static files.
- Several tool and content UIs rely on client-side interactions, forms, and custom hooks rather than a single global state store.

## Local development

```bash
npm ci
npm run dev
```

Open http://localhost:3000

For network access:

```bash
npx next dev -H 0.0.0.0 -p 3000
```

## Useful scripts

```bash
npm run dev       # start dev server
npm run build     # production build
npm run start     # serve production build
npm run lint      # lint checks
npm run analyze   # bundle analysis build
```

## Environment variables

Create a local `.env` with the required values. The exact list varies by feature, but the important frontend values are usually:

```bash
DATABASE_URL=
JWT_SECRET=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SERVER_URL=
GEMINI_API_KEY=
GEMINI_MODEL_ID=
GEMINI_EMBED_MODEL=
```

Keep secrets out of `NEXT_PUBLIC_*` variables. Those values are bundled into client code.

## Important files to know

- `app/page.tsx` : homepage entry
- `app/MainLayout.tsx` : shared layout for public pages
- `app/layout.tsx` : root metadata and global script setup
- `next.config.js` : redirects, headers, legacy URL mapping, build optimizations
- `app/lib/mongodb.ts` : MongoDB connection and cached content fetchers
- `app/(admin)/layout.tsx` : admin shell and auth flow

## Development notes

- If you are editing marketing pages, check the Mongo-backed content flow before changing static components.
- If you are editing tool pages, look under `app/(pages)/tools/` and the relevant feature components under `app/components/`.
- If you are changing routing or old slug behavior, check `next.config.js` first.
- Prefer small, feature-scoped changes. The frontend is large and route-driven, so context matters.

This app is not just a single landing page. It is a route-based frontend with a marketing site, tool experience, and an admin content system all living in the same Next.js app.


