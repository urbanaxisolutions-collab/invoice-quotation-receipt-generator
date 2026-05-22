/**
 * Money utilities - All values in minor units (cents)
 * Uses banker's rounding for final calculations
 * NO floating point for stored monetary values
 */

export type Currency = string;
export type Locale = string;

/**
 * Convert a decimal value (e.g. 19.99) to cents (1999)
 */
export function toCents(value: number | string): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Format cents into human readable currency string
 */
export function formatMoney(
  cents: number,
  currency: Currency = 'MYR',
  locale: Locale = 'en-MY'
): string {
  const amount = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Banker's rounding (round half to even)
 */
function bankersRound(value: number): number {
  const integer = Math.trunc(value);
  const fraction = value - integer;

  if (Math.abs(fraction) !== 0.5) {
    return Math.round(value);
  }

  // Round to even
  if (integer % 2 === 0) {
    return integer;
  }
  return integer + (value > 0 ? 1 : -1);
}

/**
 * Compute line total with discount
 * Discount is applied to (quantity * unitPriceCents)
 */
export function computeLineTotal({
  quantity,
  unitPriceCents,
  discountPercent,
}: {
  quantity: number;
  unitPriceCents: number;
  discountPercent: number;
}): number {
  if (quantity <= 0 || unitPriceCents < 0) return 0;

  const gross = quantity * unitPriceCents;

  if (discountPercent <= 0) return gross;
  if (discountPercent >= 100) return 0;

  const discountAmount = (gross * discountPercent) / 100;
  return Math.max(0, Math.round(gross - discountAmount));
}

/**
 * Compute full document totals
 * - Line discount applied before tax
 * - Tax calculated per line using its own taxRatePercent
 * - Final rounding uses banker's rounding
 */
export function computeDocumentTotals(
  lineItems: Array<{
    quantity: number;
    unitPriceCents: number;
    discountPercent: number;
    taxRatePercent: number;
  }>,
  docDiscountCents: number = 0,
  _currency: Currency = 'MYR'
): {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
} {
  let subtotal = 0;
  let taxTotal = 0;

  for (const item of lineItems) {
    const lineTotal = computeLineTotal({
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      discountPercent: item.discountPercent,
    });

    subtotal += lineTotal;

    if (item.taxRatePercent > 0) {
      const taxOnLine = (lineTotal * item.taxRatePercent) / 100;
      taxTotal += taxOnLine;
    }
  }

  // Apply document-level discount (after line discounts)
  const discount = Math.min(docDiscountCents, subtotal);
  const taxableAmount = subtotal - discount;

  const finalTax = bankersRound(taxTotal);
  const finalTotal = taxableAmount + finalTax;

  return {
    subtotalCents: subtotal,
    discountCents: discount,
    taxCents: finalTax,
    totalCents: Math.max(0, finalTotal),
  };
}