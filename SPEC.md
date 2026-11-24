# PassOut 2027 registration

Reservation form for PassOut 2027 (April 10–18, 2027, max 40 people,
about 40 registrations over 3 months). No online payment. Organizers
confirm or cancel by hand.

## Stack

Node.js + Express, Eta templates, Bulma, plain browser JS. Google Sheets
via service account. Resend for email (log only if no key). One Fly.io
machine, scales to zero.

## Spreadsheet (all prices and quantities live here, none in code)

- `settings` (key, value): `event_start`, `event_end`, `base_fee`,
  `reduction_per_day`, `short_stay_max_nights`, `short_stay_per_night`,
  `deposit`, `max_attendees`, `registration_open`, `organizer_emails`,
  `payment_instructions`.
- `options`: `id`, `group` (sleeping / discount / transport), `label`,
  `price`, `quantity` (empty = unlimited), `kind` (bed / share / camping /
  youth / custom), `active`, `order`.
- `registrations`: one row per person, with form answers, `status`
  (pending / confirmed / waitlist / cancelled), `sleeping`, `waitlist_for`,
  `price_total`, `price_lines`, `deposit_paid`, `admin_notes`, `token`.
  Columns found by header name.

Start values: base fee 391; the 9 bed types (king private 3 × 400, … ,
hallway couch 1 × 40); "sharing a bed with somebody who booked a bed" and
camping, unlimited at camping price; discount options as in 2026.

## Behavior

1. **Form**: same questions as the 2026 Google Form. Arrival/departure are
   dates within the event.
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
