'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock, Mail } from 'lucide-react';
import { login } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push('/admin');
    } catch (e: any) {
      setError(e?.message ?? 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--ld-bg)' }}
    >
      <div className="w-full max-w-md">
        <Link href="/" className="block mb-10 text-center">
          <span className="text-3xl font-display">
            <span className="gradient-text">FETIS</span>
            <span className="text-ink-500 dark:text-white/40 text-xs ml-2 tracking-[0.3em]">MUEBLES</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-ink-900/10 bg-ink-900/[0.03] dark:border-white/10 dark:bg-white/[0.03] backdrop-blur p-8">
          <h1 className="text-2xl font-display text-ink-900 dark:text-white mb-1">Acceso al panel</h1>
          <p className="text-ink-500 dark:text-white/50 text-sm mb-8">Ingresa con tu cuenta de Fetis.</p>

          <form onSubmit={onSubmit} className="space-y-5">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-ink-500 dark:text-white/50">Email</span>
              <div className="mt-2 relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-ink-400 dark:text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-ink-900/[0.04] border border-ink-900/10 text-ink-900 placeholder:text-ink-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/30 focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15 transition"
                  placeholder="admin@fetis.mx"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-widest text-ink-500 dark:text-white/50">Contraseña</span>
              <div className="mt-2 relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-ink-400 dark:text-white/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-ink-900/[0.04] border border-ink-900/10 text-ink-900 placeholder:text-ink-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/30 focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15 transition"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium shadow-brand-glow transition"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/" className="text-xs text-ink-500 hover:text-ink-700 dark:text-white/40 dark:hover:text-white/70 transition">
              ← Volver al sitio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
