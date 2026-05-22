import { NextRequest } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import { DocumentPDF } from '@/components/pdf/DocumentPDF';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        lineItems: true,
        client: true,
        org: true,
      },
    });

    if (!doc) {
      return new Response('Document not found', { status: 404 });
    }

    const org = doc.org || {
      name: 'Your Company Name',
      address: '',
      email: '',
      phone: '',
    };

    const stream = await renderToStream(
      <DocumentPDF
        document={doc}
        org={org}
        client={doc.client}
        lineItems={doc.lineItems}
      />
    );

    const filename = `${doc.number}.pdf`;

    return new Response(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response('Failed to generate PDF', { status: 500 });
  }
}