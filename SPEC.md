# PassOut 2027 registration

Reservation form for PassOut 2027 (April 10–18, 2027, max 40 people,
about 40 registrations over 3 months). No online payment. Organizers
confirm or cancel by hand.

## Principles

This is a very simple project. Keep the code simple, short and easy to
review. Do not overengineer: no own abstractions or layers that the
features below do not need. Prefer fewer files and plain code. Use
well-known libraries instead of writing the same thing yourself, but keep
the total complexity in proportion to this small project.

## Stack

Node.js + Express, Eta templates, Bulma, plain browser JS. Google Sheets
via service account (`google-spreadsheet` package). Resend for email (log
only if no key). One Fly.io machine, scales to zero.

## Event details and texts (in the repo, not the spreadsheet)

- `config.js`: event dates, deposit, short-stay rules, organizer emails,
  payment instructions.
- `content/*.md`: intro and section texts of the form, rendered with a
  Markdown library.

## Spreadsheet (only what people reserve, and the registrations)

- Tab `options`: everything with a price or a limited quantity.
  Columns: `id`, `group` (fee / sleeping / discount), `label`, `price`,
  `quantity` (empty = unlimited), `kind`.
  - fee rows: registration (391, quantity 40 = max attendees), price per
    missed night (−30), short-stay price per night (80).
  - sleeping rows: the 9 bed types (king private 3 × 400, … , hallway
    couch 1 × 40); "sharing a bed with somebody who booked a bed" and
    camping, unlimited, at camping price.
  - discount rows: as in 2026 (none, youth, −100, −200, other amount by
    email, +50, +100).
- Tab `registrations`: one row per person: timestamp, form answers,
  `price_total`, `price_lines`, and `status` (pending / confirmed /
  waitlist / cancelled). The app writes new rows with `pending` or
  `waitlist`. The organizers manage everything else by hand in the sheet
  (confirm, cancel, move people off the waitlist, add own columns).
  Columns found by header name.

## Behavior

1. **Form**: mirrors the 2026 Google Form (same sections, questions and
   answer types), with the 2027 details updated. Arrival and departure
   are drop-downs of the event days, as last year.
2. **Live price**: fee = base − missed nights × reduction (or nights ×
   short-stay rate if ≤ max short nights; 0 for youth) + sleeping price +
   discount/support. "Custom" discount → total "to be agreed". Show lines,
   total and deposit. Calculated only in the browser; the form submits
   the total and lines as they are (no malicious users expected).
3. **Availability**: "left" = quantity − rows in `registrations` with that
   option and status pending or confirmed. Each bed shows "N of M left".
   Changes in the sheet show on the next page load.
4. **Waitlist**: a full option (or a full event) can still be chosen,
   marked "waitlist". The row then gets status `waitlist`. Nothing else;
   the organizers handle it in the sheet.
5. **Email** on submit: to the attendee (answers, price lines, total,
   deposit, payment instructions) and to the organizers.
6. Honeypot field against spam.

## Not in v1

Admin page, payment, self-service changes, emails on status changes,
checking bed partners.

## Tasks

- [ ] Scaffold, form with live price (browser JS) on sample data
- [ ] Sheets: read options and availability, append registration
- [ ] Emails
- [ ] Dockerfile, fly.toml, README with setup steps
