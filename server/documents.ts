'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateDocumentNumber } from '@/lib/numbering';
import { computeDocumentTotals } from '@/lib/money';
import type { LineItemInput } from '@/lib/schemas';

export async function createDocument(data: {
  type: 'QUOTATION' | 'INVOICE' | 'RECEIPT';
  orgId: string;
  clientId?: string;
  currency?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  const number = await generateDocumentNumber(data.orgId, data.type);

  const document = await prisma.document.create({
    data: {
      type: data.type,
      number,
      status: data.type === 'QUOTATION' ? 'DRAFT' : 'DRAFT',
      orgId: data.orgId,
      clientId: data.clientId,
      currency: data.currency || 'MYR',
      subtotalCents: 0,
      totalCents: 0,
    },
  });

  revalidatePath('/(dashboard)/documents');
  return document;
}

export async function getDocument(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  return prisma.document.findUnique({
    where: { id },
    include: {
      lineItems: { orderBy: { sortOrder: 'asc' } },
      client: true,
    },
  });
}

export async function updateDocument(
  id: string,
  data: {
    clientId?: string;
    issueDate?: Date;
    dueDate?: Date;
    notes?: string;
    terms?: string;
    discountCents?: number;
    currency?: string;
    status?: string;
    lineItems?: LineItemInput[];
  }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  let totals = { subtotalCents: 0, discountCents: 0, taxCents: 0, totalCents: 0 };

  if (data.lineItems && data.lineItems.length > 0) {
    const lineItemsForCalc = data.lineItems.map((item) => ({
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      discountPercent: item.discountPercent,
      taxRatePercent: item.taxRatePercent,
    }));

    totals = computeDocumentTotals(lineItemsForCalc, data.discountCents || 0);
  }

  const updated = await prisma.document.update({
    where: { id },
    data: {
      clientId: data.clientId,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      notes: data.notes,
      terms: data.terms,
      discountCents: data.discountCents,
      currency: data.currency,
      status: data.status,
      subtotalCents: totals.subtotalCents,
      discountCents: totals.discountCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
    },
  });

  revalidatePath(`/(dashboard)/documents/${id}/edit`);
  return updated;
}

export async function listDocuments(params: {
  orgId: string;
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  const { orgId, type, status, search, page = 1, limit = 20 } = params;

  const where: any = { orgId };

  if (type) where.type = type;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { number: { contains: search, mode: 'insensitive' } },
      { client: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  return { documents, total, page, totalPages: Math.ceil(total / limit) };
}

export async function deleteDocument(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  await prisma.document.delete({ where: { id } });
  revalidatePath('/(dashboard)/documents');
}