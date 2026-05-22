'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function recordPayment(data: {
  documentId: string;
  amountCents: number;
  method?: string;
  reference?: string;
  note?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  const invoice = await prisma.document.findUnique({
    where: { id: data.documentId },
  });

  if (!invoice) throw new Error('Document not found');
  if (invoice.type !== 'INVOICE') throw new Error('Payments can only be recorded on Invoices');

  const newPaidCents = (invoice.paidCents || 0) + data.amountCents;

  if (newPaidCents > invoice.totalCents) {
    throw new Error('Payment amount exceeds remaining balance');
  }

  await prisma.payment.create({
    data: {
      documentId: data.documentId,
      amountCents: data.amountCents,
      method: data.method,
      reference: data.reference,
      note: data.note,
    },
  });

  let newStatus = invoice.status;
  if (newPaidCents >= invoice.totalCents) {
    newStatus = 'PAID';
  } else if (newPaidCents > 0) {
    newStatus = 'PARTIAL';
  }

  await prisma.document.update({
    where: { id: data.documentId },
    data: {
      paidCents: newPaidCents,
      status: newStatus,
    },
  });

  revalidatePath(`/(dashboard)/documents/${data.documentId}/edit`);
  return { success: true, newPaidCents, newStatus };
}

export async function getPaymentHistory(documentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  return prisma.payment.findMany({
    where: { documentId },
    orderBy: { paidAt: 'desc' },
  });
}