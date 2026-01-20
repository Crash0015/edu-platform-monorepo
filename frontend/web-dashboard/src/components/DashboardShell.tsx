'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetchAuth } from '../lib/api';
import { clearTokens, getRefreshToken } from '../lib/auth';

type NavItem = {
  label: string;
  href: string;
};

type Profile = {
  id: string;
  email: string;
  roles: string[];
  mfaEnabled: boolean;
  status: string;
};

type DashboardShellProps = {
  title: string;
  requiredRoles: string[];
  navItems: NavItem[];
  children: React.ReactNode;
};

export default function DashboardShell({ title, requiredRoles, navItems, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const activeHref = useMemo(() => navItems.find((item) => pathname.startsWith(item.href))?.href, [navItems, pathname]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiFetchAuth<Profile>('/gateway/auth/me');
        const hasRole = data.roles?.some((role) => requiredRoles.includes(role));
        if (!hasRole) {
          setError('No tienes permisos para acceder a este panel.');
          return;
        }
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el perfil de usuario');
        // Do not redirect automatically to avoid loop, let user decide
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [requiredRoles, router]);

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await apiFetchAuth('/gateway/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken, revokeFamily: true }),
        });
      }
    } catch {
      // ignore
    } finally {
      clearTokens();
      router.push('/auth/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--ink)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-6 py-24">
          <p className="text-sm text-[var(--ink-muted)]">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--ink)]">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-6 py-24">
          <p className="text-sm text-red-600">{error}</p>
          <button
            className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-semibold"
            onClick={() => router.push('/')}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-10">
        <aside className="hidden w-64 flex-col gap-6 lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">FCA</p>
            <h2 className="mt-2 text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-xs text-[var(--ink-muted)]">{profile?.email}</p>
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  activeHref === item.href
                    ? 'bg-[var(--primary)] text-white shadow-[var(--shadow)]'
                    : 'text-[var(--ink-muted)] hover:bg-white'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <button
            className="mt-auto rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink)]"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </aside>
        <main className="flex-1">
          <header className="mb-6 flex flex-col gap-3 rounded-3xl border border-[var(--border)] bg-white px-6 py-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Panel</p>
                <h1 className="text-2xl font-semibold">{title}</h1>
              </div>
              <button
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold lg:hidden"
                onClick={handleLogout}
              >
                Salir
              </button>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
