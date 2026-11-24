# Tasks: PassOut 2027 registration

- [ ] 1. Scaffold the project
  - `package.json` (type module, Node LTS), Express, Eta, Bulma, `node:test`.
  - `src/server.js` with `/healthz`, static `public/`, Bulma layout template.
  - `src/config.js` for environment variables.
  - _Requirements: none (setup)_

- [ ] 2. Pricing module
  - `src/shared/pricing.js` as a pure function with the rules from the design.
  - Unit tests: full stay, missed days, short stay, youth, custom discount,
    support, discount.
  - _Requirements: 3.2, 3.3, 3.4_

- [ ] 3. Availability module
  - `src/availability.js` with unit tests.
  - _Requirements: 4.1–4.4_

- [ ] 4. Form with live price (sample data, no storage)
  - `views/form.eta` with all fields, Bulma styling, "N of M left" / "Full".
  - `public/form.js`: imports `pricing.js`, updates price lines and total.
  - Waitlist and fallback fields appear when a full option is chosen.
  - Use a local JSON file with sample settings and options when `SHEET_ID`
    is not set.
  - _Requirements: 2.1–2.4, 3.1, 4.1, 5.1_

- [ ] 5. Google Sheets access
  - `src/sheets.js`: read tabs by header name, append row, update row by
    `id`, write lock. No cache.
  - A script `scripts/init-sheet.js` that creates the three tabs with headers
    and the start rows from the design.
  - _Requirements: 1.1, 1.2, 6.5_

- [ ] 6. Registration submit
  - `src/register.js`: validation, honeypot, status decision,
    server-side price, append row, token.
  - `/r/:token` read-only page.
  - Tests with a fake sheets module.
  - _Requirements: 1.3, 2.5, 2.6, 3.5, 4.2, 4.5, 5.2–5.4_

- [ ] 7. Admin page
  - Basic auth, list with status filter, actions confirm / cancel / promote /
    deposit-paid.
  - _Requirements: 6.1–6.5_

- [ ] 8. Emails
  - `src/mail.js` (Resend or log), templates for received, waitlist,
    confirmed, promoted, cancelled, organizer notification.
  - Hook into register and admin actions.
  - _Requirements: 7.1–7.6_

- [ ] 9. Deploy
  - `Dockerfile`, `fly.toml`, `README.md` with setup steps: service
    account, share the sheet, run `init-sheet`, set Fly secrets, verify the
    `passout.club` domain in Resend (SPF/DKIM records), deploy.
  - _Requirements: none (operations)_
