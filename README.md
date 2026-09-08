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

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To make the dev server reachable from other devices on your network:

```bash
npx next dev -H 0.0.0.0 -p 3000
```

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
