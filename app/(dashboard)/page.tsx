import Link from "next/link";

export default function DashboardHome() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-zinc-600 mt-1">Welcome back. Your documents and clients live here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/(dashboard)/documents" className="block p-6 bg-white rounded-2xl border hover:border-zinc-300 transition-colors">
          <div className="font-medium">Documents</div>
          <div className="text-sm text-zinc-500 mt-1">Quotations, Invoices &amp; Receipts</div>
        </Link>
        
        <Link href="/(dashboard)/clients" className="block p-6 bg-white rounded-2xl border hover:border-zinc-300 transition-colors">
          <div className="font-medium">Clients</div>
          <div className="text-sm text-zinc-500 mt-1">Manage your customer database</div>
        </Link>

        <div className="p-6 bg-white rounded-2xl border opacity-60">
          <div className="font-medium">Analytics</div>
          <div className="text-sm text-zinc-500 mt-1">Coming in later phase</div>
        </div>
      </div>

      <div className="mt-10 text-xs text-zinc-400">
        Phase 1 complete • Auth + Protected routes active
      </div>
    </div>
  );
}