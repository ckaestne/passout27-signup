import express from 'express';
import { Eta } from 'eta';
import { marked } from 'marked';
import { readFileSync } from 'node:fs';
import config from './config.js';

const eta = new Eta({ views: new URL('./views', import.meta.url).pathname });
const content = name => marked.parse(readFileSync(new URL(`./content/${name}.md`, import.meta.url), 'utf8'));
const texts = Object.fromEntries(['intro', 'about', 'accommodations', 'scholarship', 'dates'].map(n => [n, content(n)]));

// TODO (task 2): read from the spreadsheet.
async function loadData() {
  return JSON.parse(readFileSync(new URL('./sample-data.json', import.meta.url), 'utf8'));
}

// Adds `left` to every option with a quantity. Pending and confirmed rows hold a place.
function withAvailability({ options, registrations }) {
  const active = registrations.filter(r => r.status === 'pending' || r.status === 'confirmed');
  return options.map(o => {
    if (!o.quantity) return o;
    const used = o.id === 'registration' ? active.length : active.filter(r => r.sleeping === o.id).length;
    return { ...o, left: Math.max(0, o.quantity - used) };
  });
}

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

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/bulma', express.static('node_modules/bulma/css'));

app.get('/', async (req, res) => {
  const options = withAvailability(await loadData());
  res.send(eta.render('form', { config, texts, options, days: eventDays() }));
});

app.post('/register', async (req, res) => {
  const form = req.body;
  if (form.website) return res.redirect('/'); // honeypot
  const options = withAvailability(await loadData());
  const sleeping = options.find(o => o.id === form.sleeping);
  const registration = options.find(o => o.id === 'registration');
  const full = o => o && o.left !== undefined && o.left <= 0;
  const status = full(sleeping) || full(registration) ? 'waitlist' : 'pending';
  const row = { timestamp: new Date().toISOString(), ...form, status };
  console.log('registration', row); // TODO (task 2): append to the spreadsheet; task 3: send emails
  res.send(eta.render('thanks', { config, row, sleeping }));
});

app.get('/healthz', (req, res) => res.send('ok'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`http://localhost:${port}`));
