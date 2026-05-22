'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/(dashboard)');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-semibold tracking-tighter">DocsFlow</Link>
          <p className="text-zinc-600 mt-2">Sign in to your workspace</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                placeholder="you@company.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-zinc-900 text-white font-medium disabled:opacity-70 hover:bg-black"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-xs text-zinc-500">OR</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <button 
            className="w-full py-3 rounded-xl border border-zinc-200 font-medium flex items-center justify-center gap-2 hover:bg-zinc-50"
            onClick={() => alert('Google OAuth will be added in Auth commit')}
          >
            Continue with Google
          </button>

          <p className="text-center text-sm text-zinc-600 mt-6">
            Don\'t have an account?{' '}
            <Link href="/register" className="font-medium text-zinc-900 hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}