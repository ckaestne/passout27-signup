# Design: PassOut 2027 registration

## Overview

One Express process on one Fly.io machine. The Google Spreadsheet is the
database. Expected load is about 40 registrations in 3 months, so the
design has no cache, no queue and no rate limit. Pages are server-rendered with Eta and Bulma. One shared pricing
module runs in the browser and on the server.

```
Browser ── HTTP ──> Express ──> sheets.js (write lock) ──> Google Sheets
                          └──> mail.js ──> Resend (or log)
```

## Spreadsheet

Share the spreadsheet with the service account email (Editor).

### Tab `settings` (columns: `key`, `value`)

| key                     | example |
|-------------------------|---------|
| `event_start`           | 2027-04-10 |
| `event_end`             | 2027-04-18 |
| `base_fee`              | 391 |
| `reduction_per_day`     | 30 |
| `short_stay_max_nights` | 2 |
| `short_stay_per_night`  | 80 |
| `deposit`               | 200 |
| `max_attendees`         | 40 |
| `registration_open`     | TRUE |
| `organizer_emails`      | a@x, b@y |
| `payment_instructions`  | text |

### Tab `options`

Columns: `id`, `group` (`sleeping` | `discount` | `transport`), `label`,
`price`, `quantity` (empty = no limit), `kind`, `active`, `order`.

`kind` values: `bed`, `share`, `camping`, `youth`, `custom` (price to be
agreed), empty.

Start rows (group `sleeping`):

| id            | label                                              | price | quantity | kind    |
|---------------|----------------------------------------------------|------:|---------:|---------|
| king_private  | King bed in private room                           | 400   | 3        | bed     |
| king_cot      | King bed in room shared with 1 cot                 | 280   | 3        | bed     |
| queen_cots    | Queen bed (shared with 1 or 2 cots)                | 200   | 1        | bed     |
| double_shared | Double bed in shared room                          | 200   | 1        | bed     |
| bunk_shared   | Bunk bed in shared room                            | 160   | 2        | bed     |
| queen_tiny    | Queen bed in tiny house (no bathroom)              | 160   | 1        | bed     |
| bunk_tiny     | Bunk bed in tiny house (no bathroom)               | 64    | 2        | bed     |
| cot           | Indoor camping / cot in random place (shared room) | 40    | 10       | bed     |
| couch         | Hallway couch                                      | 40    | 1        | bed     |
| share         | Sharing a bed with somebody who booked a bed       | 0     |          | share   |
| camping       | Camping (own tent)                                 | 0     |          | camping |

Discount rows: none 0; youth (kind `youth`); lower fee −100; lower fee −200;
other lower fee (kind `custom`); support +50; support +100.

Transport rows: own transport; pickup in St. Louis on first and last day;
own transport and can give rides.

### Tab `registrations`

`id`, `created_at`, `updated_at`, `status`, `name`, `email`, `phone`,
`last_passout`, `sleeping`, `waitlist_for`, `accommodation_comments`,
`discount`, `guardian_name`, `arrive`, `leave`, `nights`, `transport`,
`transport_comments`, `diet`, `safety`, `other`, `price_total`,
`price_lines` (JSON), `deposit_paid`, `admin_notes`, `token`.

The app finds columns by header name, so organizers can add or move
columns.

## Modules

| File                     | Responsibility |
|--------------------------|----------------|
| `src/server.js`          | Express setup, static files, routes |
| `src/config.js`          | Read and check environment variables |
| `src/sheets.js`          | Read tabs into objects on each request (no cache); append and update rows by `id`; one async write lock (a promise chain, about 5 lines) |
| `src/shared/pricing.js`  | `calculatePrice(settings, options, form) → { lines, total, deposit, toBeAgreed }`. Pure function, ES module, also served to the browser |
| `src/availability.js`    | `availability(settings, options, registrations) → { [optionId]: { quantity, used, left } , totalLeft }` |
| `src/register.js`        | Validate, calculate, decide status (pending / waitlist), save, send emails. Runs inside the write lock |
| `src/mail.js`            | `send({ to, subject, html, text })`; Resend when `RESEND_API_KEY` is set, else log |
| `src/emails/*.eta`       | Email templates |
| `src/routes/public.js`   | `/`, `POST /register`, `/r/:token`, `/api/availability` |
| `src/routes/admin.js`    | `/admin`, `POST /admin/:id/:action` |
| `views/*.eta`            | Pages (Bulma) |
| `public/form.js`         | Live price and availability in the browser |

## Registration flow

1. Browser loads `/`. Server renders the form with options, settings and
   availability. `form.js` imports `pricing.js` and updates the price on
   each change.
2. `POST /register`: check honeypot, validate.
3. Take the write lock. Read the registrations. Calculate availability.
4. Decide the status:
   - event full → `waitlist`;
   - chosen bed option has places → `pending`;
   - chosen bed option full, fallback given and has places → `pending` with
     `sleeping` = fallback, `waitlist_for` = chosen option;
   - else → `waitlist`, `waitlist_for` = chosen option.
5. Calculate the price on the server. Append the row. Release the lock.
6. Send emails (attendee and organizers). An email error is logged and does
   not fail the registration.
7. Redirect to `/r/:token`.

## Admin

- Basic auth with `ADMIN_PASSWORD`.
- Actions: `confirm`, `cancel`, `promote` (set `sleeping` = `waitlist_for`
  if it has a place, clear `waitlist_for`, status `pending` → organizer then
  confirms), `deposit-paid`. Each action runs inside the write lock, checks
  availability again, updates the row and sends the email.

## Environment variables

`GOOGLE_SERVICE_ACCOUNT_JSON`, `SHEET_ID`, `ADMIN_PASSWORD`, `BASE_URL`,
`RESEND_API_KEY` (optional), `MAIL_FROM`, `PORT`.

## Deployment

- `Dockerfile` (node:lts-slim, `npm ci --omit=dev`).
- `fly.toml`: one small machine (shared-cpu-1x, 256 MB), max 1 machine,
  `auto_stop_machines = "stop"`, `min_machines_running = 0`. The machine
  stops when idle and starts on the next request (a few seconds). Health
  check `GET /healthz`.

## Testing

- Unit tests for `pricing.js` (full stay, missed days, short stay, youth,
  custom discount, negative values) and `availability.js` (pending holds,
  cancelled frees, no-limit options, `max_attendees`).
- `register.js` tested with an in-memory fake of `sheets.js`.
