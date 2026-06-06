---
name: Prisma version pinning
description: Why this repo pins Prisma to v6 instead of latest (v7), and the build/deploy implications.
---

# Pin Prisma to v6 (not v7) with Next.js 14

Install/keep both `prisma` and `@prisma/client` at `^6` (currently 6.19.3).
`npx prisma` will nag to upgrade to v7 — ignore it.

**Why:** Prisma 7 moves to an ESM/query-compiler architecture that risks
breakage with the Next.js 14 (App Router) + npm setup here. v6 with the
classic `prisma-client-js` generator and the `debian-openssl-3.0.x` binary
target is known-good on Node 20 in this Replit container.

**How to apply:**
- `prisma` lives in `dependencies` (not devDependencies) so the deploy build
  can run `prisma generate` (production installs may skip devDependencies).
- `build` script runs `prisma generate && next build`; a `postinstall` hook
  also runs `prisma generate` for fresh installs.
- If a future task requires Prisma 7, treat it as a deliberate migration and
  re-verify the build + generated client against Next 14 first.
