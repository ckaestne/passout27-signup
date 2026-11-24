# PassOut 2027 registration

Registration request form for PassOut 2027. See `SPEC.md`.

- Texts: `content/*.md` (`{base_fee}` is replaced with the registration price).
- Event dates, deposit, transport choices, organizer emails: `config.js`.
- Prices and quantities: tab `options` in the Google Sheet.
- Registrations: tab `registrations` in the Google Sheet. Set `status` to
  `confirmed` or `cancelled` by hand. Rows with `pending` or `confirmed`
  count against the quantities. You can add your own columns.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without a `.env` file the app uses
`sample-data.json`, does not save registrations, and prints emails to the log.

## Set up the Google Sheet

1. In the Google Cloud console, create a project, enable the
   **Google Sheets API**, and create a **service account**. Create a JSON key
   for it and download the file. Keep it secret.
2. Create an empty Google Sheet. Share it with the service account's
   `client_email` (Editor).
3. Copy `.env.example` to `.env`. Set `SHEET_ID` (the long ID in the sheet
   URL) and `GOOGLE_SERVICE_ACCOUNT_JSON` (the key file on one line, for
   example the output of `jq -c . key.json`).
4. Run `npm run init-sheet`. It creates the tabs `options` (with the start
   values from `sample-data.json`) and `registrations`.

## Set up email (Resend)

1. Create an account at resend.com and add the domain `passout.club`.
   Add the DNS records that Resend shows.
2. Create an API key. Set `RESEND_API_KEY` and `MAIL_FROM` (an address on
   the verified domain).

## Deploy on Fly.io

```bash
fly launch --no-deploy        # first time only; keeps fly.toml
fly secrets set SHEET_ID=... RESEND_API_KEY=... MAIL_FROM="PassOut <register@passout.club>"
fly secrets set GOOGLE_SERVICE_ACCOUNT_JSON="$(jq -c . key.json)"
fly deploy --ha=false         # exactly one machine
```

The machine stops when idle and starts again on the next request.
