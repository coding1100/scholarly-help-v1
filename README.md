<<<<<<< HEAD
# ScholarlyHelp — Web App

Next.js 14 (App Router) frontend for ScholarlyHelp: marketing/landing pages, the AI tools suite (paraphraser, citation generator, humanizer, study workspace, etc.), the student/admin dashboards, and the order/quote flow.

> **This is a private repository.** Do not fork it publicly, do not paste code from it into public gists/StackOverflow/AI tools that retain input, and do not share the repo URL or its contents outside the team. It contains business logic, internal tooling, and (in CI config) references to production credentials — see [Security note](#security-note) below.

## Tech stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB (native driver, no ORM) — CMS-style page content, tool usage, study sessions, etc.
- **AI:** Google Gemini (content generation, tutoring, STEM solving)
- **Auth:** JWT-based, custom implementation
- **Payments:** Stripe
- **Editor:** Tiptap (rich text, used in study/essay tools)
- **Hosting:** Amazon EC2 via PM2 (see [Deployment](#deployment)) — **not** Vercel, despite what older docs may say

## Getting started
=======
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
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8

```bash
npm ci
npm run dev
```

<<<<<<< HEAD
Open [http://localhost:3000](http://localhost:3000).

To make the dev server reachable from other devices on your network:
=======
Open http://localhost:3000

For network access:
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8

```bash
npx next dev -H 0.0.0.0 -p 3000
```

<<<<<<< HEAD
### Environment variables

Copy the variable **names** below into a local `.env` and fill in real values (ask a team member for secrets — never commit them):

```
DATABASE_URL=
TOOL_USAGE_DATABASE_NAME=
JWT_SECRET=
API_KEY=
GEMINI_API_KEY=
GEMINI_MODEL_ID=
GEMINI_EMBED_MODEL=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SERVER_URL=
NEXT_BASE_URL=
NEXT_PUBLIC_NGROX_URL=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_COMPANY_PHONE_NUMBER=
NEXT_PUBLIC_TEXT_US_PHONE_NUMBER=
DIRECTUS_URL=
DIRECTUS_TOKEN=
DIRECTUS_KEY=
DIRECTUS_SECRET=
DIRECTUS_ADMIN_EMAIL=
DIRECTUS_ADMIN_PASSWORD=
REPORT_ADMIN_USERNAME=
REPORT_ADMIN_PASSWORD=
```

`NEXT_PUBLIC_*` variables are inlined into the client bundle at build time — never put real secrets in a `NEXT_PUBLIC_*` variable.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (extra memory headroom via `NODE_OPTIONS`) |
| `npm run start` | Serve a production build |
| `npm run lint` | Next.js/ESLint checks |
| `npm run analyze` | Production build with the bundle analyzer enabled |
| `npm run test:detector-v2` | Verification script for the AI-detector integration |

There is no repo-local test runner configured beyond the script above; typecheck with `npx tsc --noEmit` before pushing.

## Project structure

```
app/
  (pages)/        Route groups for every public page (marketing, tools, take-my-class variants, etc.)
  (admin)/        Admin panel routes (separate Tailwind build — see tailwind.admin.config.ts)
  components/     Shared UI, organized by feature area (AiTools/, AiLandingPage/, LandingPage/, ...)
  api/            Next.js API routes
  lib/            Server helpers (MongoDB client, route tables, etc.)
  context/        React context providers
  data/           Static JSON content
public/           Static assets
```

Route naming: tool **landing pages** live under `/tools/<slug>` (e.g. `/tools/citation-generator`); the working tools themselves also live under `/tools/`. Older top-level slugs (`/ai-paraphraser`, `/pythagoras-solver`, etc.) 301-redirect to their `/tools/...` equivalents — see the `redirects()` block in `next.config.js`.

## Deployment

Deployment is handled by `.github/workflows/deploy.yml` on every push to `main`: it builds the app, packages `.next`, `public`, and `node_modules`, then ships and restarts it on an EC2 instance via PM2. There is no preview-deploy/staging pipeline configured — pushing to `main` deploys to production.

## Security note

`.github/workflows/deploy.yml` currently hardcodes some non-secret-store credentials (admin username/password, a JWT signing secret) directly in the workflow file rather than in GitHub Actions Secrets. Treat these as sensitive despite their location, and prioritize moving them into `secrets.*` the next time that file is touched.
=======
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


>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
