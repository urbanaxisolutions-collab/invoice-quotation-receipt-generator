'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDocument, updateDocument } from '@/server/documents';
import { convertQuotationToInvoice, convertInvoiceToReceipt } from '@/server/conversions';
import { computeDocumentTotals } from '@/lib/money';
import type { LineItemInput } from '@/lib/schemas';

interface LineItem extends LineItemInput {
  id?: string;
}

export default function DocumentEditor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const documentId = params.id;

  const [document, setDocument] = useState<any>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [discountCents, setDiscountCents] = useState(0);

  useEffect(() => {
    async function load() {
      const doc = await getDocument(documentId);
      if (doc) {
        setDocument(doc);
        setLineItems(doc.lineItems || []);
        setDiscountCents(doc.discountCents || 0);
      }
      setLoading(false);
    }
    load();
  }, [documentId]);

  const totals = computeDocumentTotals(
    lineItems.map((item) => ({
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      discountPercent: item.discountPercent,
      taxRatePercent: item.taxRatePercent,
    })),
    discountCents
  );

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: '',
        quantity: 1,
        unitPriceCents: 0,
        discountPercent: 0,
        taxRatePercent: 0,
        sortOrder: lineItems.length,
      },
    ]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const saveDocument = async () => {
    setSaving(true);
    try {
      await updateDocument(documentId, {
        discountCents,
        lineItems,
      });
      alert('Document saved successfully');
    } catch (e) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!confirm('Convert this quotation into an Invoice?')) return;

    setConverting(true);
    try {
      const newInvoice = await convertQuotationToInvoice(documentId);
      alert('Successfully converted to Invoice!');
      router.push(`/(dashboard)/documents/${newInvoice.id}/edit`);
    } catch (error: any) {
      alert(error.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  const handleConvertToReceipt = async () => {
    if (!confirm('Convert this invoice into a Receipt?')) return;

    setConverting(true);
    try {
      const newReceipt = await convertInvoiceToReceipt(documentId);
      alert('Successfully converted to Receipt!');
      router.push(`/(dashboard)/documents/${newReceipt.id}/edit`);
    } catch (error: any) {
      alert(error.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  if (loading) return <div className="p-8">Loading document...</div>;
  if (!document) return <div>Document not found</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 text-sm font-medium rounded-full bg-zinc-900 text-white">
              {document.type}
            </span>
            <span className="text-2xl font-semibold tracking-tight">{document.number}</span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">Draft • Auto-saves coming soon</p>
        </div>

        <div className="flex items-center gap-3">
          {/* PDF Download */}
          <a
            href={`/api/documents/${documentId}/pdf`}
            target="_blank"
            className="px-4 py-2 border border-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-50"
          >
            Download PDF
          </a>

          {/* Conversion Buttons */}
          {document?.type === 'QUOTATION' && (
            <button
              onClick={handleConvertToInvoice}
              disabled={converting}
              className="px-5 py-2.5 border border-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
            >
              {converting ? 'Converting...' : 'Convert to Invoice →'}
            </button>
          )}

          {document?.type === 'INVOICE' && ['PAID', 'PARTIAL'].includes(document?.status) && (
            <button
              onClick={handleConvertToReceipt}
              disabled={converting}
              className="px-5 py-2.5 border border-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
            >
              {converting ? 'Converting...' : 'Convert to Receipt →'}
            </button>
          )}

          <button
            onClick={saveDocument}
            disabled={saving}
            className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-medium disabled:opacity-70"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border">
            <h3 className="font-medium mb-4">Client &amp; Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-600">Client</label>
                <input 
                  type="text" 
                  placeholder="Select or create client"
                  className="w-full mt-1.5"
                  defaultValue={document.client?.name || ''}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-600">Issue Date</label>
                <input type="date" className="w-full mt-1.5" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-medium">Line Items</h3>
              <button 
                onClick={addLineItem}
                className="text-sm px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg font-medium"
              >
                + Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="text-left px-6 py-3 font-medium">Description</th>
                    <th className="w-24 text-right px-4 py-3 font-medium">Qty</th>
                    <th className="w-32 text-right px-4 py-3 font-medium">Unit Price</th>
                    <th className="w-24 text-right px-4 py-3 font-medium">Discount %</th>
                    <th className="w-24 text-right px-4 py-3 font-medium">Tax %</th>
                    <th className="w-32 text-right px-6 py-3 font-medium">Line Total</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => {
                    const lineTotal = (item.quantity * item.unitPriceCents) * (1 - item.discountPercent / 100);
                    return (
                      <tr key={index} className="border-t">
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            className="w-full border-0 focus:ring-1"
                            placeholder="Item description"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.unitPriceCents / 100}
                            onChange={(e) => updateLineItem(index, 'unitPriceCents', Math.round(parseFloat(e.target.value) * 100))}
                            className="w-full text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.discountPercent}
                            onChange={(e) => updateLineItem(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                            className="w-full text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.taxRatePercent}
                            onChange={(e) => updateLineItem(index, 'taxRatePercent', parseFloat(e.target.value) || 0)}
                            className="w-full text-right"
                          />
                        </td>
                        <td className="px-6 py-3 text-right font-medium">
                          {(lineTotal / 100).toFixed(2)}
                        </td>
                        <td className="px-2 py-3">
                          <button 
                            onClick={() => removeLineItem(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>
          </div>

          {lineItems.length === 0 && (
            <div className="p-8 text-center text-zinc-400 text-sm">
              No line items yet. Click "Add Item" to start.
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border space-y-6">
          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea 
              className="w-full mt-2 h-24" 
              placeholder="Internal notes..."
              defaultValue={document.notes || ''}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Terms &amp; Conditions</label>
            <textarea 
              className="w-full mt-2 h-24" 
              placeholder="Payment terms, validity period..."
              defaultValue={document.terms || ''}
            />
          </div>
        </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border sticky top-6">
            <h3 className="font-semibold mb-6">Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Subtotal</span>
                <span className="font-medium">RM {(totals.subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Discount</span>
                <span className="font-medium text-red-600">- RM {(totals.discountCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Tax</span>
                <span className="font-medium">RM {(totals.taxCents / 100).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>RM {(totals.totalCents / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <label className="text-sm font-medium block mb-2">Document Discount (RM)</label>
              <input
                type="number"
                value={discountCents / 100}
                onChange={(e) => setDiscountCents(Math.round(parseFloat(e.target.value || '0') * 100))}
                className="w-full"
              />
            </div>

            <button 
              onClick={saveDocument}
              className="mt-8 w-full py-3 bg-zinc-900 text-white rounded-xl font-medium"
            >
              Save Document
            </button>
          </div>

          {document?.parentDocumentId && (
            <div className="bg-white p-6 rounded-2xl border mt-6">
              <h4 className="font-medium mb-3 text-sm">Related Documents</h4>
              <div className="text-sm text-zinc-600">
                This document was converted from another document.
              </div>
              <a 
                href={`/(dashboard)/documents/${document.parentDocumentId}/edit`} 
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                View Source Document →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}