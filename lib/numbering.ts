import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Atomically generates the next document number for an organization.
 * Uses Prisma transaction to safely increment the counter.
 */
export async function generateDocumentNumber(
  orgId: string,
  type: 'QUOTATION' | 'INVOICE' | 'RECEIPT'
): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const org = await tx.organization.findUnique({
      where: { id: orgId },
      select: {
        quotePrefix: true,
        invoicePrefix: true,
        receiptPrefix: true,
        nextQuoteNo: true,
        nextInvoiceNo: true,
        nextReceiptNo: true,
      },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    let prefix: string;
    let nextNumber: number;
    let updateData: any = {};

    if (type === 'QUOTATION') {
      prefix = org.quotePrefix;
      nextNumber = org.nextQuoteNo;
      updateData = { nextQuoteNo: { increment: 1 } };
    } else if (type === 'INVOICE') {
      prefix = org.invoicePrefix;
      nextNumber = org.nextInvoiceNo;
      updateData = { nextInvoiceNo: { increment: 1 } };
    } else {
      prefix = org.receiptPrefix;
      nextNumber = org.nextReceiptNo;
      updateData = { nextReceiptNo: { increment: 1 } };
    }

    // Update the counter
    await tx.organization.update({
      where: { id: orgId },
      data: updateData,
    });

    // Format as PREFIX-00001
    const formattedNumber = `${prefix}-${String(nextNumber).padStart(5, '0')}`;

    return formattedNumber;
  });
}