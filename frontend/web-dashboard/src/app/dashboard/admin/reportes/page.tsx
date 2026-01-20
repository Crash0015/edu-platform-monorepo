'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { adminNav } from '../../../../lib/nav';

type Summary = {
  users: { total: number; active: number; suspended: number; byType: Record<string, number> };
  counts: {
    courses: number;
    enrollments: number;
    materials: number;
    availability: number;
    tutoringSessions: number;
    tutoringBookings: number;
  };
};

export default function AdminReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await apiFetchAuth<Summary>('/gateway/admin/reports/summary');
        setSummary(response);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo cargar reportes.';
        setError(message);
      }
    };
    loadSummary();
  }, []);

  return (
    <DashboardShell title="Administración" requiredRoles={['ADMIN']} navItems={adminNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Resumen general</h2>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {summary && (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { label: 'Cursos activos', value: summary.counts.courses },
                { label: 'Matrículas', value: summary.counts.enrollments },
                { label: 'Materiales', value: summary.counts.materials },
                { label: 'Disponibilidad', value: summary.counts.availability },
                { label: 'Tutorías', value: summary.counts.tutoringSessions },
                { label: 'Reservas', value: summary.counts.tutoringBookings },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <p className="text-xs uppercase text-[var(--ink-muted)]">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {summary && (
          <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Usuarios</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] p-4">
                <p className="text-xs uppercase text-[var(--ink-muted)]">Total</p>
                <p className="mt-2 text-2xl font-semibold">{summary.users.total}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] p-4">
                <p className="text-xs uppercase text-[var(--ink-muted)]">Activos</p>
                <p className="mt-2 text-2xl font-semibold">{summary.users.active}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] p-4">
                <p className="text-xs uppercase text-[var(--ink-muted)]">Suspendidos</p>
                <p className="mt-2 text-2xl font-semibold">{summary.users.suspended}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {Object.entries(summary.users.byType || {}).map(([role, count]) => (
                <div key={role} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <p className="text-xs uppercase text-[var(--ink-muted)]">{role}</p>
                  <p className="mt-2 text-2xl font-semibold">{count}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
