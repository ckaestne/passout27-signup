// Options and registrations: from the Google Sheet if SHEET_ID is set, else from sample-data.json.
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { readFileSync } from 'node:fs';

export const registrationColumns = ['timestamp', 'status', 'name', 'email', 'phone', 'last_passout',
  'sleeping', 'accommodation_comments', 'discount', 'arrive', 'leave', 'transport', 'transport_comments',
  'diet', 'safety', 'other', 'price_total', 'price_lines'];

// Keeps the promise, so parallel requests wait for the same loadInfo(). Forgets it on failure, so the next request tries again.
let docPromise;
export function openSheet() {
  docPromise ??= (async () => {
    const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const auth = new JWT({ email: key.client_email, key: key.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID, auth);
    await doc.loadInfo();
    return doc;
  })().catch(err => { docPromise = undefined; throw err; });
  return docPromise;
}

const sample = () => JSON.parse(readFileSync(new URL('./sample-data.json', import.meta.url), 'utf8'));

export async function loadData() {
  if (!process.env.SHEET_ID) return sample();
  const d = await openSheet();
  const rows = async title => (await d.sheetsByTitle[title].getRows()).map(r => r.toObject());
  const options = (await rows('options')).filter(o => o.id).map(o => ({
    ...o, price: Number(o.price) || 0, quantity: o.quantity ? Number(o.quantity) : undefined,
  }));
  return { options, registrations: await rows('registrations') };
}

export async function addRegistration(row) {
  if (!process.env.SHEET_ID) return console.log('registration (no SHEET_ID, not saved)', row);
  await (await openSheet()).sheetsByTitle.registrations.addRow(row, { raw: true }); // raw: '+1 555…' stays text, not a formula
}

// Adds `left` to every option with a quantity. Pending and confirmed rows hold a place.
export function withAvailability({ options, registrations }) {
  const active = registrations.filter(r => r.status === 'pending' || r.status === 'confirmed');
  return options.map(o => {
    if (!o.quantity) return o;
    const used = o.id === 'registration' ? active.length : active.filter(r => r.sleeping === o.id).length;
    return { ...o, left: Math.max(0, o.quantity - used) };
  });
}
