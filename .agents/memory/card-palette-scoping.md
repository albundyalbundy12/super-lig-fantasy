---
name: Card palette scoping
description: How the dark-shell / light-card theme keeps legacy inline-styled content readable.
---

The app uses a dark navy/green shell with off-white cards. Many page elements
were written with inline styles referencing CSS custom properties
(`var(--text)`, `var(--muted)`, `var(--border)`, `var(--accent)`).

**Rule:** `.card` redeclares those custom properties locally (on-light values)
so any descendant using `var(--…)` automatically renders with the correct
on-light palette inside cards, while the same variables hold on-dark values at
the shell level.

**Why:** lets a global theme swap happen without editing every inline-styled
element across all pages — the cascade does the work.

**How to apply:** when adding new content that must read correctly on the light
card surface, reference the shared `var(--text)/--muted/--border/--accent`
tokens instead of hardcoding colors; place it inside `.card`. For on-dark
surfaces (topbar, page-header outside cards), the shell-level values apply.
