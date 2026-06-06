---
name: Testing server-only Next.js logic
description: How to exercise functions guarded by `import "server-only"` outside the React-server runtime
---

# Testing server-only modules in this repo

`import "server-only"` throws under plain `node`/`tsx` (the package's default
export throws; only the `react-server` export condition is a no-op). So you
cannot smoke-test such modules by importing them in an ad-hoc `tsx -e` script.

**To exercise server-only logic live:** add a throwaway `src/app/api/<name>/route.ts`
GET handler that calls the function and returns `NextResponse.json(result)`,
restart the `Start application` workflow, `curl http://localhost:5000/api/<name>`,
then delete the route + restart. Hit it twice to confirm idempotency.

**Why:** the team's generators/scoring live behind `server-only`; this is the
only reliable way to run them through the real Next runtime without shipping a
permanent endpoint.

**Gotchas:** `python3` is NOT installed — pipe curl JSON through `node -e` or
`jq`, not `python3 -m json.tool`. Inspect DB directly with `psql "$DATABASE_URL"`.
