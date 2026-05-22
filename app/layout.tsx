import type { Metadata } from 'next';
import { GeistSans, GeistMono } from 'geist/font';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'DocsFlow • Invoices, Quotations & Receipts',
  description: 'Professional invoice, quotation and receipt generator with powerful conversion workflows.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased bg-zinc-50 text-zinc-900">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}