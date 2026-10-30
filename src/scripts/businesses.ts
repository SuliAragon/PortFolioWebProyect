const money = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

document.querySelectorAll<HTMLElement>('[data-filter-root]').forEach(root => {
  root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button => button.addEventListener('click', () => {
    root.querySelectorAll<HTMLElement>('[data-category]').forEach(panel => panel.hidden = panel.dataset.category !== button.dataset.filter);
    root.querySelectorAll('[data-filter]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
  }));
});

const today = new Date();
const localDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
document.querySelectorAll<HTMLInputElement>('[data-future-date]').forEach(input => input.min = localDate);

document.querySelectorAll<HTMLAnchorElement>('article a').forEach(link => link.addEventListener('click', () => {
  if (link.hash !== '#reserva') return;
  const name = link.closest('article')?.querySelector('h3')?.textContent;
  const select = document.querySelector<HTMLSelectElement>('[data-booking] select[name="service"]');
  if (!name || !select) return;
  const option = Array.from(select.options).find(option => option.value.startsWith(name));
  if (option) select.value = option.value;
}));

document.querySelectorAll<HTMLFormElement>('[data-booking]').forEach(form => form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const date = new Date(`${data.get('date')}T12:00:00`);
  const result = form.querySelector<HTMLElement>('[data-booking-result]')!;
  result.textContent = `Tu elección: ${data.get('service')}. ${date.toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })} a las ${data.get('time')}. Es una demostración; no se ha enviado ni confirmado una reserva.`;
}));

const fuel = document.querySelector<HTMLFormElement>('[data-fuel]');
const updateFuel = () => {
  if (!fuel || !fuel.checkValidity()) return;
  const data = new FormData(fuel);
  fuel.querySelector<HTMLOutputElement>('[data-fuel-total]')!.value = money(Number(data.get('fuel')) * Number(data.get('litres')));
};
fuel?.addEventListener('submit', event => { event.preventDefault(); updateFuel(); });
fuel?.addEventListener('input', updateFuel);

const stay = document.querySelector<HTMLFormElement>('[data-stay]');
stay?.addEventListener('submit', event => {
  event.preventDefault();
  if (!stay.reportValidity()) return;
  const data = new FormData(stay);
  const start = Date.parse(`${data.get('arrival')}T00:00:00Z`);
  const end = Date.parse(`${data.get('departure')}T00:00:00Z`);
  const nights = Math.round((end - start) / 86400000);
  const result = stay.querySelector<HTMLElement>('[data-stay-result]')!;
  result.textContent = nights <= 0 ? 'La salida debe ser posterior a la llegada.' : `${nights} ${nights === 1 ? 'noche' : 'noches'} · ${money(nights * Number(data.get('room')))} en total, desayuno incluido. Estimación de demostración; no se ha reservado una habitación.`;
});

const basket = new Map<string, { quantity: number; price: number }>();
const renderBasket = () => {
  const items = document.querySelector<HTMLElement>('[data-basket-items]');
  const total = document.querySelector<HTMLOutputElement>('[data-basket-total]');
  if (!items || !total) return;
  items.textContent = [...basket].map(([name, item]) => `${item.quantity} × ${name}`).join(' · ') || 'Todavía hay sitio para algo rico.';
  total.value = money([...basket.values()].reduce((sum, item) => sum + item.quantity * item.price, 0));
};
document.querySelectorAll<HTMLButtonElement>('[data-basket-add]').forEach(button => button.addEventListener('click', () => {
  const name = button.dataset.name!;
  const current = basket.get(name);
  basket.set(name, { quantity: (current?.quantity || 0) + 1, price: Number(button.dataset.price) });
  renderBasket();
}));
document.querySelector('[data-basket-clear]')?.addEventListener('click', () => { basket.clear(); renderBasket(); });
