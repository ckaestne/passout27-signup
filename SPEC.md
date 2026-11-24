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
- Tab `registrations`: one row per person, with form answers, `status`
  (pending / confirmed / waitlist / cancelled), `sleeping`, `waitlist_for`,
  `price_total`, `price_lines`, `deposit_paid`, `admin_notes`, `token`.
  Columns found by header name.

## Behavior

1. **Form**: mirrors the 2026 Google Form (same sections, questions and
   answer types), with the 2027 details updated. Arrival and departure
   are drop-downs of the event days, as last year.
2. **Live price**: fee = base − missed nights × reduction (or nights ×
   short-stay rate if ≤ max short nights; 0 for youth) + sleeping price +
   discount/support. "Custom" discount → total "to be agreed". Show lines,
   total and deposit. Server recalculates with the same module.
3. **Availability**: each bed shows "N of M left". Pending and confirmed
   hold a place. Writes go through one lock to avoid double booking.
4. **Waitlist**: if a bed is full, join its waitlist, optionally with a
   fallback option that is reserved now. If the event is full, new
   registrations go to the waitlist.
5. **Admin** (`/admin`, password): list and filter; confirm, cancel,
   promote, mark deposit paid. Editing the sheet directly also works.
6. **Email** to attendee on received / waitlisted / confirmed / promoted /
   cancelled, with price and a link to a read-only page `/r/:token`.
   Organizers get a mail for each new registration.
7. Honeypot field against spam.

## Not in v1

Payment, self-service changes, automatic waitlist promotion, checking bed
partners.

## Tasks

- [ ] Scaffold, pricing module + tests, form with live price on sample data
- [ ] Sheets storage, availability, waitlist, submit, `/r/:token`
- [ ] Admin page
- [ ] Emails
- [ ] Dockerfile, fly.toml, README with setup steps
