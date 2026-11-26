// Reads .env from the project folder before other modules use process.env, however the app is started.
// Variables that are already set (shell, Fly secrets) keep their value: .env does not change them.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(new URL('./.env', import.meta.url));
const names = ['SHEET_ID', 'GOOGLE_SERVICE_ACCOUNT_JSON', 'RESEND_API_KEY', 'MAIL_FROM'];
const preset = names.filter(n => n in process.env);

if (existsSync(file)) {
  process.loadEnvFile(file);
  console.log(`Settings: read ${file}`);
} else {
  console.log(`Settings: no ${file}, using only environment variables`);
}
for (const n of preset) console.log(`Settings: ${n} comes from the environment${process.env[n] ? '' : ' and is EMPTY'}; .env does not change it`);
