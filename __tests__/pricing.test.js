import { computeTotals, formatPrice } from '../src/utils/pricing';

describe('computeTotals', () => {
  it('applies discount, then 5% service charge and 15% tax', () => {
    const items = [{ price: 1800, quantity: 2 }];
    expect(computeTotals(items, 20)).toEqual({
      subtotal: 3600,
      discount: 720,
      serviceCharge: 144,
      salesTax: 432,
      grandTotal: 3456,
    });
  });

  it('works with no discount', () => {
    const t = computeTotals([{ price: 1000, quantity: 1 }], 0);
    expect(t.grandTotal).toBe(1200);
  });

  it('formats rupees with thousands separators', () => {
    expect(formatPrice(3456)).toBe('Rs 3,456');
    expect(formatPrice(1234.5)).toBe('Rs 1,234.50');
  });
});
