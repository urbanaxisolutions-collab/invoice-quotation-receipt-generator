import { z } from 'zod';

// Reusable money schema (in cents)
export const MoneyCentsSchema = z.number().int().nonnegative();

// Line Item Schema
export const LineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  unitPriceCents: MoneyCentsSchema,
  discountPercent: z.number().min(0).max(100),
  taxRatePercent: z.number().min(0).max(100),
  sortOrder: z.number().int().default(0),
});

// Document Schema (base)
export const DocumentSchema = z.object({
  type: z.enum(['QUOTATION', 'INVOICE', 'RECEIPT']),
  clientId: z.string().optional(),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  currency: z.string().default('MYR'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  discountCents: MoneyCentsSchema.default(0),
});

// Client Schema
export const ClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

// Payment Schema
export const PaymentSchema = z.object({
  amountCents: MoneyCentsSchema,
  method: z.string().optional(),
  reference: z.string().optional(),
  note: z.string().optional(),
  paidAt: z.coerce.date().optional(),
});

export type LineItemInput = z.infer<typeof LineItemSchema>;
export type DocumentInput = z.infer<typeof DocumentSchema>;
export type ClientInput = z.infer<typeof ClientSchema>;
export type PaymentInput = z.infer<typeof PaymentSchema>;