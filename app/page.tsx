import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 text-sm font-medium mb-6">
          Production-grade • Open source
        </div>
        
        <h1 className="text-6xl font-semibold tracking-tighter mb-4">
          DocsFlow
        </h1>
        <p className="text-2xl text-zinc-600 mb-8">
          Invoices. Quotations. Receipts.<br />Beautifully connected.
        </p>

        <div className="flex gap-4 justify-center">
          <Link 
            href="/login" 
            className="px-8 py-3 rounded-xl bg-zinc-900 text-white font-medium hover:bg-black transition-colors"
          >
            Get Started
          </Link>
          <Link 
            href="https://github.com/urbanaxisolutions-collab/invoice-quotation-receipt-generator" 
            target="_blank"
            className="px-8 py-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 font-medium transition-colors"
          >
            View on GitHub
          </Link>
        </div>

        <p className="mt-12 text-sm text-zinc-500">
          Built with Next.js 14 • Prisma • NextAuth • React-PDF
        </p>
      </div>
    </div>
  );
}