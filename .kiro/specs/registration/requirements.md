# Requirements: PassOut 2027 registration

## Introduction

A web form where people reserve a place at PassOut 2027. The form shows the
price live and shows how many places are left for each sleeping option.
Organizers confirm, cancel and promote registrations on an admin page. All
prices and quantities come from the spreadsheet.

## Requirement 1: Configuration from the spreadsheet

**User story:** As an organizer, I want to change prices, quantities and
texts in the spreadsheet, so that I do not need a developer or a redeploy.

1. The system SHALL read all prices, quantities, event dates and rules from
   the spreadsheet. The code SHALL NOT contain prices or quantities.
2. WHEN an organizer changes the spreadsheet THEN the system SHALL use the
   new values on the next page load (no cache).
3. WHEN `registration_open` is FALSE THEN the system SHALL show a
   "registration closed" message instead of the form.

## Requirement 2: Registration form

**User story:** As an attendee, I want one simple form, so that I can
reserve my place.

1. The form SHALL ask for: name, email, phone, last PassOut attended (or how
   they heard about it), sleeping option, comments on accommodation,
   discount or support option, guardian name (youth only), arrival date,
   departure date, transport option, transport comments, diet, "anything we
   should know for you to feel safe and included", anything else.
2. The sleeping options SHALL be: each bed option from the spreadsheet,
   "sharing a bed with somebody who booked a bed", and camping.
3. The discount and support options SHALL come from the spreadsheet.
4. Arrival and departure SHALL be dates inside the event dates, with
   departure after arrival.
5. WHEN a required field is missing or not valid THEN the system SHALL show
   the form again with the entered values and a message at each field.
6. The system SHALL reject submissions that fill a hidden honeypot field.

## Requirement 3: Live price

**User story:** As an attendee, I want to see the final price while I fill
in the form, so that I know what I will pay.

1. WHEN the attendee changes a sleeping option, discount option, or date
   THEN the form SHALL show each price line and the total at once.
2. The price SHALL be:
   - nights = departure − arrival;
   - IF nights ≤ `short_stay_max_nights` THEN fee = nights ×
     `short_stay_per_night`; ELSE fee = `base_fee` − (full nights − nights)
     × `reduction_per_day`;
   - IF the discount option is marked youth THEN fee = 0;
   - total = fee + price of sleeping option + price of discount option.
3. WHEN the discount option is marked "to be agreed" THEN the form SHALL
   show the total as "to be agreed with the organizers".
4. The form SHALL show the deposit that is due now (`deposit`).
5. The server SHALL calculate the price again on submit with the same code,
   and SHALL store its own result, not the value from the browser.

## Requirement 4: Availability

**User story:** As an attendee, I want to see which beds are still
available, so that I can choose one that I can get.

1. For each bed option, the form SHALL show "N of M left" or "Full".
   M = quantity from the spreadsheet. N = M − registrations with that option
   and status `pending` or `confirmed`.
2. A `pending` registration SHALL hold its place.
3. Camping and "sharing a bed" SHALL have no limit.
4. The total of `pending` and `confirmed` registrations SHALL NOT be more
   than `max_attendees`.
5. WHEN two people submit for the last place at the same time THEN the
   system SHALL give the place to one of them only.

## Requirement 5: Waitlist

**User story:** As an attendee, I want to join a waitlist when my option is
full, so that I can still get a place.

1. WHEN a bed option is full THEN the form SHALL let the attendee join the
   waitlist for it, and SHALL ask for a fallback sleeping option (optional).
2. WHEN the attendee gives a fallback option THEN the system SHALL reserve
   the fallback option (`pending`) and record the waitlist option.
3. WHEN the attendee gives no fallback option THEN the registration SHALL get
   status `waitlist`.
4. WHEN the event is at `max_attendees` THEN each new registration SHALL get
   status `waitlist`.

## Requirement 6: Admin page

**User story:** As an organizer, I want to confirm or cancel registrations
with one click, so that I do not edit the spreadsheet by hand.

1. `/admin` SHALL require a password from an environment variable.
2. The page SHALL list all registrations with status, name, sleeping option,
   waitlist option, total price, deposit paid, and date, and SHALL filter by
   status.
3. The page SHALL have actions: Confirm, Cancel, Promote (from waitlist or
   to the waitlist option), Mark deposit paid.
4. Each action SHALL update the spreadsheet and send the matching email.
5. Organizers MAY also edit the spreadsheet directly. The system SHALL read
   the status from the spreadsheet as the source of truth.

## Requirement 7: Emails

**User story:** As an attendee, I want emails about my registration, so
that I know its status and what to pay.

1. The system SHALL send an email to the attendee WHEN the registration is
   received, put on the waitlist, confirmed, promoted, or cancelled.
2. Each email to the attendee SHALL contain the sleeping option, the price
   lines, the total, and a link to a read-only page of the registration
   (secret token in the URL).
3. The confirmation email SHALL contain the payment instructions from the
   spreadsheet.
4. The system SHALL send an email to the organizers for each new
   registration.
5. Replies SHALL go to the organizers (`reply_to`).
6. WHEN no email provider key is set THEN the system SHALL write the emails
   to the log.

## Out of scope (version 1)

- Online payment.
- Attendees change or cancel their registration themselves.
- Automatic promotion from the waitlist.
- Rate limiting, caching, scaling. Expected load is about 40 registrations
  in 3 months.
- Checking that a "sharing a bed" person has a partner with a bed (organizers
  check this by hand).
