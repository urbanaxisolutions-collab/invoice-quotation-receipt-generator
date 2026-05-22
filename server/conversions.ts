'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateDocumentNumber } from '@/lib/numbering';

/**
 * Convert Quotation → Invoice
 */
export async function convertQuotationToInvoice(quoteId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  const quote = await prisma.document.findUnique({
    where: { id: quoteId },
    include: { lineItems: true },
  });

  if (!quote) throw new Error('Quotation not found');
  if (quote.type !== 'QUOTATION') throw new Error('Only quotations can be converted to invoices');
  if (quote.status === 'DECLINED') throw new Error('Cannot convert a declined quotation');
  if (quote.parentDocumentId) throw new Error('This quotation has already been converted');

  // Get organization for default terms
  const org = await prisma.organization.findFirst({
    where: { documents: { some: { id: quoteId } } },
  });

  const dueDate = new Date(quote.issueDate);
  dueDate.setDate(dueDate.getDate() + (org?.defaultNetTerms || 14));

  const invoiceNumber = await generateDocumentNumber(quote.orgId, 'INVOICE');

  const invoice = await prisma.document.create({
    data: {
      type: 'INVOICE',
      number: invoiceNumber,
      status: 'DRAFT',
      orgId: quote.orgId,
      clientId: quote.clientId,
      issueDate: new Date(),
      dueDate,
      currency: quote.currency,
      notes: quote.notes,
      terms: quote.terms,
      subtotalCents: quote.subtotalCents,
      discountCents: quote.discountCents,
      taxCents: quote.taxCents,
      totalCents: quote.totalCents,
      parentDocumentId: quote.id,
      lineItems: {
        create: quote.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          discountPercent: item.discountPercent,
          taxRatePercent: item.taxRatePercent,
          lineTotalCents: item.lineTotalCents,
          sortOrder: item.sortOrder,
        })),
      },
    },
  });

  await prisma.document.update({
    where: { id: quoteId },
    data: { status: 'ACCEPTED' },
  });

  revalidatePath('/(dashboard)/documents');
  return invoice;
}

/**
 * Convert Invoice → Receipt (only if PAID or PARTIAL)
 */
export async function convertInvoiceToReceipt(invoiceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  const invoice = await prisma.document.findUnique({
    where: { id: invoiceId },
    include: { lineItems: true, payments: true },
  });

  if (!invoice) throw new Error('Invoice not found');
  if (invoice.type !== 'INVOICE') throw new Error('Only invoices can be converted to receipts');
  if (!['PAID', 'PARTIAL'].includes(invoice.status)) {
    throw new Error('Can only convert paid or partially paid invoices to receipts');
  }

  const receiptNumber = await generateDocumentNumber(invoice.orgId, 'RECEIPT');

  const receipt = await prisma.document.create({
    data: {
      type: 'RECEIPT',
      number: receiptNumber,
      status: 'ISSUED',
      orgId: invoice.orgId,
      clientId: invoice.clientId,
      issueDate: new Date(),
      currency: invoice.currency,
      notes: invoice.notes,
      terms: invoice.terms,
      subtotalCents: invoice.subtotalCents,
      discountCents: invoice.discountCents,
      taxCents: invoice.taxCents,
      totalCents: invoice.totalCents,
      paidCents: invoice.paidCents,
      parentDocumentId: invoice.id,
      lineItems: {
        create: invoice.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          discountPercent: item.discountPercent,
          taxRatePercent: item.taxRatePercent,
          lineTotalCents: item.lineTotalCents,
          sortOrder: item.sortOrder,
        })),
      },
    },
  });

  revalidatePath('/(dashboard)/documents');
  return receipt;
}