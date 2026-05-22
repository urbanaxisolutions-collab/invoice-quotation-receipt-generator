import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* TODO: Add proper sidebar + top nav in Phase 3 */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-semibold tracking-tight text-xl">DocsFlow</div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-zinc-600">{session.user?.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button className="text-red-600 hover:underline">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}