# Tech

- Node.js LTS, Express, Eta templates (server-rendered), plain browser JS.
- Bulma 1.x for CSS. No front-end framework, no build step.
- Storage: one Google Spreadsheet through a service account (`googleapis`).
- Email: third-party transactional service (Resend), sending from a
  verified `passout.club` address. Behind a small `mail.send()` interface.
- Hosting: Fly.io, exactly one machine (min = max = 1).
- Tests: `node:test`. No other test framework.
- Secrets only in environment variables (Fly secrets), never in the repo.
- Keep dependencies few.
