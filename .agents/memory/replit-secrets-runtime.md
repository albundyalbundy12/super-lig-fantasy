---
name: Replit secrets require workflow restart
description: New/changed Replit Secrets are not visible to an already-running workflow process until it restarts.
---

# Newly added secrets need a workflow restart

When a secret (e.g. `SPORTMONKS_API_TOKEN`) is added or changed in Replit
Secrets, a workflow process that was already running does NOT see it —
`process.env.X` reads as undefined inside the running Next.js dev server even
though the same variable is present in a fresh shell.

**Why:** env vars are injected at process start. The shell you run ad-hoc
commands in is a new process (sees the secret); the long-lived workflow is not.

**How to apply:** after adding/rotating a secret, `restart_workflow` before
testing server code that reads it. Symptom: "X is not configured" errors from
server code while `echo $X` in the shell shows it present.
