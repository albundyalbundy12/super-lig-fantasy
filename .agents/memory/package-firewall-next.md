---
name: Package firewall blocks some npm versions
description: Replit's Socket package firewall 403s certain npm package versions; pick an allowed one rather than fighting it.
---

# Package firewall blocks specific npm versions

Installing npm packages on this Replit can fail with HTTP 403 "Blocked by
Security Policy" from `package-firewall.replit.local` (Socket Security). This is
**version-specific**, not package-specific.

**Observed (June 2026):** `next@15.x` (15.0.3, 15.5.4) were blocked; `next@14.2.25`
and `next@14.2.30` were allowed. The project therefore runs on Next 14 (App
Router), not Next 15.

**Why:** Socket flags some published versions in its threat feed; the firewall
denies just those tarballs.

**How to apply:** When `npm install` 403s on a version, don't retry the same
version or reach for `--force`. Probe candidate versions directly and use one
that returns 200:
`curl -s -o /dev/null -w "%{http_code}" "http://package-firewall.replit.local/npm/<pkg>/-/<pkg>-<version>.tgz"`
Then pin that version. Note Next 14 needs a JS config (`next.config.mjs`),
not the Next 15 `next.config.ts`, and lacks `allowedDevOrigins` (harmless dev
warning only).
