'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDocument } from '@/server/documents';

export default function NewDocumentPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (type: 'QUOTATION' | 'INVOICE' | 'RECEIPT') => {
    setLoading(true);
    try {
      const doc = await createDocument({
        type,
        orgId: 'demo-org-id',
      });
      router.push(`/(dashboard)/documents/${doc.id}/edit`);
    } catch (error) {
      alert('Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-semibold mb-8 text-center">Create New Document</h1>

      <div className="space-y-4">
        {(['QUOTATION', 'INVOICE', 'RECEIPT'] as const).map((type) => (
          <button
            key={type}
            onClick={() => handleCreate(type)}
            disabled={loading}
            className="w-full p-6 bg-white border rounded-2xl text-left hover:border-zinc-400 transition-all disabled:opacity-50"
          >
            <div className="font-semibold text-lg">{type}</div>
            <div className="text-sm text-zinc-500 mt-1">
              {type === 'QUOTATION' && 'Send to client for approval'}
              {type === 'INVOICE' && 'Request payment from client'}
              {type === 'RECEIPT' && 'Confirm payment received'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}