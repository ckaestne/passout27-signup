import express from 'express';
import { Eta } from 'eta';
import { marked } from 'marked';
import { readFileSync } from 'node:fs';
import config from './config.js';
import { loadData, addRegistration, withAvailability } from './data.js';
import { sendMail } from './mail.js';

const eta = new Eta({ views: new URL('./views', import.meta.url).pathname });
const content = name => marked.parse(readFileSync(new URL(`./content/${name}.md`, import.meta.url), 'utf8'));
const texts = Object.fromEntries(['intro', 'about', 'accommodations', 'scholarship', 'dates'].map(n => [n, content(n)]));

// All event days as { value: '2027-04-10', label: 'Saturday, April 10' }.
function eventDays() {
  const days = [];
  for (let d = new Date(config.start + 'T12:00:00Z'); d <= new Date(config.end + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) {
    days.push({
      value: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }),
    });
  }
  return days;
}

// Plain-text summary of a registration for the emails.
function summary(row, options) {
  const label = id => options.find(o => o.id === id)?.label || id;
  return [
    `Name: ${row.name}`, `Email: ${row.email}`, `Phone: ${row.phone}`, `Last PassOut: ${row.last_passout}`,
    `Accommodation: ${label(row.sleeping)}`, `Accommodation comments: ${row.accommodation_comments}`,
    `Discount/support: ${label(row.discount)}`, `Arrive: ${row.arrive}`, `Leave: ${row.leave}`,
    `Transport: ${row.transport}`, `Transport comments: ${row.transport_comments}`,
    `Diet: ${row.diet}`, `Safe and included: ${row.safety}`, `Anything else: ${row.other}`,
    '', 'Price:', row.price_lines,
  ].join('\n').replaceAll('undefined', '');
}

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/bulma', express.static('node_modules/bulma/css'));

app.get('/', async (req, res) => {
  const options = withAvailability(await loadData());
  // Texts can use {base_fee}; the value comes from the spreadsheet.
  const baseFee = '$' + options.find(o => o.id === 'registration').price;
  const filled = Object.fromEntries(Object.entries(texts).map(([k, v]) => [k, v.replaceAll('{base_fee}', baseFee)]));
  res.send(eta.render('form', { config, texts: filled, options, days: eventDays() }));
});

app.post('/register', async (req, res) => {
  const form = req.body;
  if (form.website) return res.redirect('/'); // honeypot
  if (!form.name || !form.email || !form.sleeping || !form.discount) return res.status(400).send('Please fill in all required fields.');
  const row = { ...form, timestamp: new Date().toISOString(), status: 'pending' };
  const { options } = await loadData();
  await addRegistration(row);

  const text = summary(row, options);
  await sendMail({
    to: row.email, replyTo: config.organizerEmails, subject: `${config.title}: request received`,
    text: `Hi ${row.name},\n\nthank you for your registration request. We will follow up by email with a confirmation and information on how to pay the deposit.\n\n${text}\n`,
  });
  await sendMail({ to: config.organizerEmails, replyTo: row.email, subject: `New registration: ${row.name}`, text });
  res.send(eta.render('thanks', { config, row }));
});

app.get('/healthz', (req, res) => res.send('ok'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`http://localhost:${port}`));
