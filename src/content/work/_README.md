# work collection (case studies)

One Markdown file per case study. Files starting with `_` are ignored by the loader.

```md
---
title: Short descriptive title of the project
client: Client name (as approved for publication)
industry: Industry
services: [static-websites, seo]
summary: What was built and why (40-240 characters).
publishedDate: 2026-01-15
website: https://example.com
approvedByClient: false
draft: true
---

Body: the client's situation, the approach, what shipped, and what was learned.
```

Rules enforced by `npm run check:content`:

- A published (non-draft) entry must have `approvedByClient: true`.
- `results` requires `resultsSource` describing where the numbers come from.
- Never invent outcomes, quotes, or statistics.
