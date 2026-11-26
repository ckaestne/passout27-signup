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
2. The sheet is "PassOut 2027 registrations" in Christian's Drive (ID
   `1R_cudaU-PAeWgyCZPKo6S9ZpjNzEQSDt8q8fAqjQeEc`), already with both tabs.
   Share it with the service account's `client_email` (Editor).
   For a new, empty sheet, run `npm run init-sheet` after step 3.
3. Copy `.env.example` to `.env`. Set `SHEET_ID` (the long ID in the sheet
   URL) and `GOOGLE_SERVICE_ACCOUNT_JSON` (the key file on one line, for
   example the output of `jq -c . key.json`).

## Set up email (Resend)

1. Create an account at resend.com and add the domain `stner.de`.
   Add the DNS records that Resend shows.
2. Create an API key. Set `RESEND_API_KEY` and `MAIL_FROM` (an address on
   the verified domain).
3. Replies go to `organizerEmails` in `config.js` (the emails set `replyTo`).

## Deploy on Fly.io

First time only:

```bash
fly auth login
fly launch --no-deploy        # keeps fly.toml; choose a new app name if "passout27-signup" is taken
fly secrets import < .env     # SHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON, RESEND_API_KEY, MAIL_FROM
```

Each deploy:

```bash
fly deploy --ha=false         # exactly one machine
fly logs                      # look for the "settings missing" warning
```

`.env` and key files are not copied into the image (`.dockerignore`); on Fly the
settings come only from `fly secrets`. The machine stops when idle and starts
again on the next request.
