'use client';

import { FormEvent, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { teacherNav } from '../../../../lib/nav';
import { useProfile } from '../../../../hooks/useProfile';

type Session = {
  id: string;
  teacherId: string;
  courseId: string | null;
  startTime: string;
  endTime: string;
  status: string;
};

export default function TeacherTutoringPage() {
  const { profile } = useProfile();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState('');
  const [range, setRange] = useState({ start: '', end: '' });

  const handleFetch = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile?.id) {
      return;
    }
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('teacherId', profile.id);
      if (range.start) params.set('startTimeFrom', range.start);
      if (range.end) params.set('startTimeTo', range.end);
      const response = await apiFetchAuth<Session[]>(`/gateway/tutoring/sessions/available?${params.toString()}`);
      setSessions(response || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar sesiones.';
      setError(message);
    }
  };

  return (
    <DashboardShell title="Docente" requiredRoles={['TEACHER']} navItems={teacherNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Sesiones disponibles</h2>
          <p className="text-sm text-[var(--ink-muted)]">Consulta las tutorías abiertas para tus estudiantes.</p>
          <form onSubmit={handleFetch} className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              type="datetime-local"
              value={range.start}
              onChange={(event) => setRange({ ...range, start: event.target.value })}
            />
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              type="datetime-local"
              value={range.end}
              onChange={(event) => setRange({ ...range, end: event.target.value })}
            />
            <button className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white">
              Consultar
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4 grid gap-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">No hay sesiones disponibles en el rango.</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-[var(--border)] px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}</p>
                      <p className="text-xs text-[var(--ink-muted)]">Curso: {session.courseId || 'General'} · Estado: {session.status}</p>
                    </div>
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">ID {session.id}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
