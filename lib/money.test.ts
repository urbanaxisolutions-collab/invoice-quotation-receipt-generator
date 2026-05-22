import { describe, it, expect } from 'vitest';
import {
  toCents,
  formatMoney,
  computeLineTotal,
  computeDocumentTotals,
} from './money';

describe('Money Utilities', () => {
  describe('toCents', () => {
    it('converts decimal to cents correctly', () => {
      expect(toCents(19.99)).toBe(1999);
      expect(toCents('49.50')).toBe(4950);
      expect(toCents(0)).toBe(0);
    });

    it('handles invalid input', () => {
      expect(toCents(NaN)).toBe(0);
      expect(toCents('abc')).toBe(0);
    });
  });

  describe('formatMoney', () => {
    it('formats MYR correctly', () => {
      expect(formatMoney(1999, 'MYR', 'en-MY')).toContain('19.99');
    });

    it('formats large amounts', () => {
      expect(formatMoney(123456789, 'MYR')).toContain('1,234,567.89');
    });
  });

  describe('computeLineTotal', () => {
    it('calculates basic line total', () => {
      const result = computeLineTotal({
        quantity: 2,
        unitPriceCents: 1500,
        discountPercent: 0,
      });
      expect(result).toBe(3000);
    });

    it('applies discount correctly', () => {
      const result = computeLineTotal({
        quantity: 1,
        unitPriceCents: 10000,
        discountPercent: 10,
      });
      expect(result).toBe(9000);
    });

    it('handles 100% discount', () => {
      const result = computeLineTotal({
        quantity: 5,
        unitPriceCents: 2000,
        discountPercent: 100,
      });
      expect(result).toBe(0);
    });

    it('handles zero quantity', () => {
      const result = computeLineTotal({
        quantity: 0,
        unitPriceCents: 5000,
        discountPercent: 0,
      });
      expect(result).toBe(0);
    });
  });

  describe('computeDocumentTotals', () => {
    it('calculates simple document with no discount/tax', () => {
      const result = computeDocumentTotals([
        { quantity: 2, unitPriceCents: 1000, discountPercent: 0, taxRatePercent: 0 },
      ]);

      expect(result.subtotalCents).toBe(2000);
      expect(result.discountCents).toBe(0);
      expect(result.taxCents).toBe(0);
      expect(result.totalCents).toBe(2000);
    });

    it('handles mixed tax rates and line discounts', () => {
      const result = computeDocumentTotals([
        { quantity: 1, unitPriceCents: 10000, discountPercent: 10, taxRatePercent: 6 },
        { quantity: 2, unitPriceCents: 5000, discountPercent: 0, taxRatePercent: 0 },
      ]);

      // Line 1: 10000 - 10% = 9000, tax 6% = 540 → subtotal 9000
      // Line 2: 10000
      // Total subtotal: 19000
      expect(result.subtotalCents).toBe(19000);
      expect(result.taxCents).toBe(540);
      expect(result.totalCents).toBe(19540);
    });

    it('applies document level discount', () => {
      const result = computeDocumentTotals(
        [{ quantity: 1, unitPriceCents: 10000, discountPercent: 0, taxRatePercent: 0 }],
        1500 // doc discount
      );

      expect(result.subtotalCents).toBe(10000);
      expect(result.discountCents).toBe(1500);
      expect(result.totalCents).toBe(8500);
    });

    it('guards against negative values', () => {
      const result = computeDocumentTotals([
        { quantity: -1, unitPriceCents: 1000, discountPercent: 0, taxRatePercent: 0 },
      ]);
      expect(result.totalCents).toBe(0);
    });
  });
});