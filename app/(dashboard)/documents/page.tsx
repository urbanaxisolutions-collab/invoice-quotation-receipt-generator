import Link from 'next/link';
import { listDocuments } from '@/server/documents';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);
  
  const orgId = 'demo-org-id';

  const { documents } = await listDocuments({ orgId, limit: 50 });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
          <p className="text-zinc-600">Quotations, Invoices &amp; Receipts</p>
        </div>
        <Link
          href="/(dashboard)/documents/new"
          className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-black"
        >
          + New Document
        </Link>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Number</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Client</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Type</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-600">Status</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-zinc-600">Total</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-zinc-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {documents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No documents yet. Create your first one.
                </td>
              </tr>
            )}
            {documents.map((doc: any) => (
              <tr key={doc.id} className="hover:bg-zinc-50">
                <td className="px-6 py-4 font-medium">
                  <Link href={`/(dashboard)/documents/${doc.id}/edit`} className="hover:underline">
                    {doc.number}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm">{doc.client?.name || '—'}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100">
                    {doc.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm capitalize">{doc.status.toLowerCase()}</span>
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  {doc.totalCents ? (doc.totalCents / 100).toFixed(2) : '0.00'}
                </td>
                <td className="px-6 py-4 text-right text-sm text-zinc-500">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}