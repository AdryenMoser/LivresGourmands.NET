const dollar = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' });

export function money(value) {
  return dollar.format(Number(value) || 0);
}

export function stars(note) {
  const n = Math.round(Number(note) || 0);
  return `${'★'.repeat(n)}${'☆'.repeat(Math.max(0, 5 - n))}`;
}
