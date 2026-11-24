// Live price. Runs only in the browser; the result is submitted with the form.
const form = document.getElementById('form');
const fees = JSON.parse(document.getElementById('fees').textContent);
const dollars = n => (n < 0 ? '−$' : '$') + Math.abs(n);
const days = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

function update() {
  const arrive = form.arrive.value, leave = form.leave.value;
  const allNights = days(form.arrive.options[0].value, form.leave.options[0].value);
  const nights = days(arrive, leave);
  const sleeping = form.querySelector('[name=sleeping]:checked');
  const discount = form.querySelector('[name=discount]:checked');
  const lines = [];

  if (nights < 1) {
    show([], 'Please choose a departure after your arrival.');
    return;
  }
  if (discount?.dataset.kind === 'youth') {
    lines.push([`Registration, ${nights} nights (youth)`, 0]);
  } else if (nights <= fees.shortStayMaxNights) {
    lines.push([`Short stay, ${nights} × ${dollars(fees.shortNight)}`, nights * fees.shortNight]);
  } else {
    lines.push([`Registration, all ${allNights} nights`, fees.registration]);
    if (nights < allNights) lines.push([`${allNights - nights} missed nights`, (allNights - nights) * fees.missedNight]);
  }
  if (sleeping) lines.push([sleeping.dataset.label, +sleeping.dataset.price]);
  if (discount && +discount.dataset.price) lines.push([discount.dataset.label, +discount.dataset.price]);

  const total = lines.reduce((sum, [, p]) => sum + p, 0);
  const custom = discount?.dataset.kind === 'custom';
  lines.push(['Total', custom ? 'to be agreed' : total]);
  show(lines, custom ? 'We will agree on the fee by email.'
    : `Deposit due now: ${dollars(Math.min(fees.deposit, total))} (non-refundable).`);
  form.price_total.value = custom ? 'to be agreed' : total;
  form.price_lines.value = lines.map(([l, p]) => `${l}: ${typeof p === 'number' ? dollars(p) : p}`).join('\n');
}

function show(lines, note) {
  document.getElementById('price-lines').replaceChildren(...lines.map(([label, p], i) => {
    const tr = document.createElement('tr');
    for (const [text, cls] of [[label, ''], [typeof p === 'number' ? dollars(p) : p, 'has-text-right']]) {
      const cell = document.createElement(i === lines.length - 1 ? 'th' : 'td');
      cell.textContent = text;
      cell.className = cls;
      tr.append(cell);
    }
    return tr;
  }));
  document.getElementById('price-note').textContent = note;
}

form.addEventListener('change', update);
form.addEventListener('submit', e => {
  if (days(form.arrive.value, form.leave.value) < 1) e.preventDefault();
});
update();
