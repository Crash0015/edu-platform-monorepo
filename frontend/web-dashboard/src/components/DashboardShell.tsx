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

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [openNotifications, setOpenNotifications] = useState(false);

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
        try {
          const response = await apiFetchAuth<{ items: NotificationItem[] }>(`/gateway/notifications/users/${data.id}`);
          setNotifications(response.items || []);
        } catch (err) {
          console.error('Failed to load notifications', err);
        }
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

  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleMarkRead = async () => {
    if (!profile) {
      return;
    }
    try {
      const response = await apiFetchAuth<{ items: NotificationItem[] }>(
        `/gateway/notifications/users/${profile.id}/read`,
        { method: 'POST' },
      );
      setNotifications(response.items || []);
      setOpenNotifications(false);
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
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
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    className="relative rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
                    onClick={() => setOpenNotifications((prev) => !prev)}
                    type="button"
                  >
                    Notificaciones
                    {unreadCount > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--primary)] px-2 text-xs font-semibold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {openNotifications && (
                    <div className="absolute right-0 z-20 mt-3 w-80 max-h-80 overflow-auto rounded-2xl border border-[var(--border)] bg-white p-4 shadow-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Actividad reciente</p>
                        <button className="text-xs text-[var(--primary)]" onClick={handleMarkRead} type="button">
                          Marcar como leidas
                        </button>
                      </div>
                      <div className="mt-3 space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-[var(--ink-muted)]">No hay notificaciones nuevas.</p>
                        ) : (
                          notifications.map((item) => (
                            <div
                              key={item.id}
                              className={`rounded-xl border border-[var(--border)] px-3 py-2 text-xs ${
                                item.read ? 'bg-[var(--surface-muted)] text-[var(--ink-muted)]' : 'bg-white'
                              }`}
                            >
                              <p className="font-semibold text-[var(--ink)]">{item.title}</p>
                              <p className="mt-1 text-[var(--ink-muted)]">{item.body}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold lg:hidden"
                  onClick={handleLogout}
                >
                  Salir
                </button>
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
