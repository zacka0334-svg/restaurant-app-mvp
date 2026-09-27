// Named rate constants for the Order Summary.
export const SERVICE_CHARGE_RATE = 0.05; // 5%
export const SALES_TAX_RATE = 0.15; // 15%

const round = (n) => Math.round(n * 100) / 100;

// Pure calculation, used inside useMemo on the Order Summary screen.
// Discount is taken off the subtotal first; service charge and tax are
// charged on the discounted amount.
export function computeTotals(items, discountPercent = 0) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = round((subtotal * discountPercent) / 100);
  const taxable = subtotal - discount;
  const serviceCharge = round(taxable * SERVICE_CHARGE_RATE);
  const salesTax = round(taxable * SALES_TAX_RATE);
  const grandTotal = round(taxable + serviceCharge + salesTax);
  return { subtotal: round(subtotal), discount, serviceCharge, salesTax, grandTotal };
}

export function formatPrice(amount) {
  // Manual formatting (no Intl dependency): 1234.5 -> "Rs 1,234.50"
  const n = round(Number(amount) || 0);
  const [whole, frac] = n.toFixed(2).split('.');
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return frac === '00' ? `Rs ${withCommas}` : `Rs ${withCommas}.${frac}`;
}

export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
