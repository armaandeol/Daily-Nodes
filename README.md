# Roz — Web

The Next.js client for **Roz** ("daily" in Punjabi) — a life-logging app styled
like a hand-drawn sketchbook/newspaper. You log short moments ("nodes"), share
select ones with a small group ("Circle"), and read back an AI-written daily
digest designed to look and feel like a tiny newspaper edition.

The API this talks to lives in [`daily-nodes-backend`](../daily-nodes-backend)
(FastAPI) — see its README for the server side, data model, and the digest
pipeline this app renders.

> 📸 *Screenshot: Home page (today's feed) goes here.*
> 📸 *Screenshot: an Explore digest edition goes here.*
> 📸 *Screenshot: the node composer / photo crop flow goes here.*
> 📸 *Screenshot: the profile page + activity calendar goes here.*

---

## Table of contents

- [What this app does](#what-this-app-does)
- [Tech stack](#tech-stack)
- [Architecture at a glance](#architecture-at-a-glance)
- [Pages](#pages)
- [The "paper" design system](#the-paper-design-system)
- [Notable engineering decisions](#notable-engineering-decisions)
- [Running locally](#running-locally)
- [Environment variables](#environment-variables)
- [Known rough edges](#known-rough-edges)

## What this app does

- **Home (`/home`)** — today's page: a greeting, your Circle status, a day
  switcher, and a feed of nodes rendered as polaroids (photo logs) or sticky
  notes (text logs). Infinite-scrolls by day as you page backwards.
- **Explore (`/explore`)** — the digest reader. Each generated digest renders as a
  newspaper "edition": headline, narrative, a hero photo the AI picked itself, a
  pull quote, a Circle section, and a "pivot" nudge for tomorrow. Older/newer
  editions are a click away.
- **Profile (`/profile`)** — your bio, display name, digest time preference
  (morning/night), avatar, and a scrapbook-styled activity calendar (a GitHub-style
  contribution grid, redrawn as torn-paper photo snapshots).
- **Join (`/join/[token]`)** — accepting a Circle invite link.
- **Sign-in / sign-up** — Clerk-hosted auth UI, embedded via `@clerk/nextjs`.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router)**, React 19 | server components for data-fetching pages, Server Actions as the API client |
| Auth | **Clerk** (`@clerk/nextjs`) | session + JWT; every Server Action calls `auth().getToken()` and forwards it to the backend as a Bearer token |
| Styling | **Tailwind CSS v4**, hand-rolled "sketchbook" primitives | see [design system](#the-paper-design-system) |
| Animation | **Framer Motion** | page transitions, drop-in digest sections, calendar photo reveals |
| State | **Zustand** (one small store, not a general state layer) | a client-side stale-while-revalidate cache — see below |
| Photo cropping | **react-easy-crop** + canvas export | mandatory crop step before any photo upload |
| Component primitives | **Radix UI / shadcn** | accessible unstyled primitives under `src/components/ui`, available but lightly used — most of the app's visuals are the custom sketch system instead |

## Architecture at a glance

```
Browser
  │
  ├─ Server Components (page.tsx) ──fetch w/ Clerk token──► FastAPI backend
  │     Home, Explore, Profile pages render server-side first,
  │     then hand data to client components for interactivity.
  │
  └─ Client Components ("use client")
        │
        ├─ Server Actions ("use server", in actions.ts per route)
        │     The only place that talks to the backend. Every function
        │     re-derives the Clerk token itself (`auth().getToken()`)
        │     rather than trusting anything passed in from the client.
        │
        └─ Zustand client-cache (src/lib/client-cache.ts)
              Stale-while-revalidate for data that needs to survive
              page-transition remounts (see below).
```

There is **no client-side API client/fetch wrapper** in the traditional sense —
each route's `actions.ts` is a thin, explicit set of server functions
(`fetchNodes`, `createNode`, `fetchUserGroup`, …) that each independently attach
auth and call the FastAPI backend directly. This trades a bit of repetition for
every data dependency being visible and auditable per file.

## Pages

| Route | Server component | Key client components |
|---|---|---|
| `/home` | `app/home/page.tsx` | `NodeFeed` (feed + infinite scroll + day nav), `NodeComposer` (create a log, lazy-loaded), `GroupManager` (Circle status/management, lazy-loaded modals) |
| `/explore` | `app/explore/page.tsx` | `EditionMotion` (drop-in/slide animation), reads `edition-history.ts` to resolve older/newer/latest |
| `/profile` | `app/profile/page.tsx` | `ActivityCalendar` (contribution calendar with photo thumbnails) |
| `/join/[token]` | `app/join/[token]/page.tsx` | invite-acceptance flow |

## The "paper" design system

Everything visual funnels through `src/components/sketch/` — tape, tacks, stamped
labels, hand-drawn scribble underlines/arrows (SVG `motion.path` with
`pathLength` animation), and a `WobblyButton` that "presses flat" on click via a
hard drop-shadow that animates to zero offset. The intent is that every surface
(a node card, a digest page, a calendar cell) reads as a physical object on a
desk, not a conventional web card.

A few specific touches worth knowing about:

- **Four node "paper styles"** (`postit`, `lined`, `index`, `scrap`) are chosen per
  log at creation time and stored on the node (`style` column, backend-side) so a
  log always re-renders the same way, not randomly.
- **Deterministic randomness.** Card tilts, calendar wash shapes, and torn-edge
  clip-paths are picked from fixed arrays indexed by something stable (card index,
  day-of-month) — "random-looking" but reproducible between server and client
  renders, which matters because truly random values would mismatch during
  hydration.
- **Ghost/ghost-loading states** (`PageMotion.tsx`'s `GhostHome`, `GhostExplore`,
  `GhostProfile`) are hand-built skeletons that mirror each real page's exact
  layout, not a generic shimmer box — so the loading state doesn't visually jump
  when real content arrives.

## Notable engineering decisions

- **A client cache that survives forced remounts.** `template.tsx` wraps every
  page in `PageMotion` for the paper-drop page-transition animation — which, by
  how Next.js template remounting works, unmounts and remounts a page's client
  components on every navigation. That would normally throw away local state and
  force a refetch on every back/forward nav. `src/lib/client-cache.ts` is a tiny
  Zustand store living *outside* the React tree specifically to survive that:
  `useCachedFetch`/`peekCache`/`writeCache` let a component synchronously read
  whatever was last fetched (so it paints real data on the very first render
  instead of a ghost state) while still kicking off a background revalidation.
  `ActivityCalendar` and the home feed both use this.
- **Infinite scroll with pagination, not "fetch everything".** The backend caps
  unpaginated requests at 20 nodes; `NodeFeed` fetches in pages of 12 via an
  `IntersectionObserver` sentinel, and — importantly — refresh/reaction-sync calls
  re-request *however many pages were already loaded*, not just page one, so
  reacting to a node or creating a new log doesn't silently roll back scroll
  progress.
- **Stale closures handled with refs, not state, inside the observer.** The
  `IntersectionObserver` callback in `NodeFeed` is only rebuilt when the date
  changes, so `hasMore`/`loadingMore`/node count are mirrored into refs
  (`hasMoreRef`, etc.) that the closure reads fresh each time, instead of
  capturing stale state from when the observer was created.
- **Mandatory photo crop before upload.** `PhotoCropEditor` (react-easy-crop) +
  `photo-crop.ts`'s canvas-based `createCroppedPhoto()` means only the cropped
  pixels are ever encoded and uploaded — the original, uncropped file never leaves
  the browser.
- **Local-date parsing to dodge a timezone footgun.** `parseLocalDate()` in
  `NodeFeed.tsx` manually parses a `YYYY-MM-DD` string instead of
  `new Date("YYYY-MM-DD")`, which JavaScript interprets as UTC midnight — on
  timezones behind UTC that silently shifts "today" back a day.
- **"Today" resolved client-side, after mount.** Both the home feed's current date
  and the activity calendar avoid computing `new Date()` during server render,
  specifically so the server's clock (wherever it's deployed) and the browser's
  clock can't disagree and cause a hydration mismatch right around midnight.
- **Route-level code splitting for anything not needed on first paint.**
  `NodeComposer` (pulls in `react-easy-crop`) and the Circle management modals are
  loaded via `next/dynamic` rather than bundled into Home's initial JS, since most
  visits to Home don't open either.
- **Digest-link gating mirrors the backend's own rule.** The backend only
  generates a digest once a day has 3+ logs; `NodeFeed` independently checks
  `nodes.length >= 3` before showing a "go to this day's digest →" link, so the
  UI doesn't invite a user to a digest page it knows will 404.

## Running locally

Requires the backend running (see `daily-nodes-backend`'s README) — default
expected at `http://localhost:8000`.

```bash
npm install
cp .env.example .env.local     # see Environment variables below
npm run dev
```

Opens on `http://localhost:3000`.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes | Clerk client key |
| `CLERK_SECRET_KEY` | yes | Clerk server key, used by `auth()`/`currentUser()` in Server Actions |
| `CLERK_WEBHOOK_SECRET` | no (frontend doesn't verify webhooks) | present in `.env` but unused here — the backend verifies Clerk webhooks, not this app |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `_SIGN_UP_URL` / `_AFTER_SIGN_IN_URL` / `_AFTER_SIGN_UP_URL` | yes | Clerk redirect config |
| `NEXT_PUBLIC_API_URL` | **yes in any real deploy** | base URL of the FastAPI backend; every `actions.ts` falls back to `http://localhost:8000` if unset, which is only correct in local dev |

> **Note:** the current `.env` also has `GROQ_API_KEY` / `GROQ_MODEL` entries.
> Nothing in this repo's source references them — they look like a stray copy from
> the backend's `.env` and are safe to remove here.

## Known rough edges

- **A second, unused routing scaffold lives alongside the real app.**
  `src/router.tsx`, `src/routes/`, `src/routeTree.gen.ts`, `src/server.ts`,
  `src/start.ts`, and `vite.config.ts` are a leftover **TanStack Start** setup from
  this project's original Lovable scaffold. The app now runs entirely on **Next.js
  App Router** (`src/app/`, driven by `next.config.ts` and the `next` scripts in
  `package.json`) — none of those TanStack files are built or served. They're dead
  weight, not a second code path in production; safe to delete, left alone here so
  nothing is lost without a deliberate decision to remove it.
- **`src/proxy.ts`** *is* live, despite the name — Next.js 16 renamed the
  `middleware.ts` convention to `proxy.ts`. It's where Clerk's route protection for
  `/home(.*)` is wired up.
- See the note on stray `GROQ_*` env vars above.

---

*For the system-wide picture — how this talks to the backend, the digest pipeline
this app renders, and the full data model — see
[`PROJECT_DOCUMENT.md`](../daily-nodes-backend/PROJECT_DOCUMENT.md) in the backend
repo.*
