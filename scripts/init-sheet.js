// Creates the `options` and `registrations` tabs (if missing) with headers and the start rows
// from sample-data.json. Run once: npm run init-sheet
import { openSheet, registrationColumns } from '../data.js';
import { readFileSync } from 'node:fs';

const { options } = JSON.parse(readFileSync(new URL('../sample-data.json', import.meta.url), 'utf8'));
const doc = await openSheet();

if (!doc.sheetsByTitle.options) {
  const sheet = await doc.addSheet({ title: 'options', headerValues: ['id', 'group', 'label', 'price', 'quantity', 'kind'] });
  await sheet.addRows(options);
  console.log('Created tab "options"');
}
if (!doc.sheetsByTitle.registrations) {
  await doc.addSheet({ title: 'registrations', headerValues: registrationColumns });
  console.log('Created tab "registrations"');
}
console.log('Done.');
