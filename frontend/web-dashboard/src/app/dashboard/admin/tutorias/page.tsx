'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { adminNav } from '../../../../lib/nav';

type Session = {
  id: string;
  teacherId: string;
  courseId: string | null;
  availabilitySlotId: string;
  startTime: string;
  endTime: string;
  status: string;
};

type Booking = {
  id: string;
  tutoringSessionId: string;
  studentId: string;
  status: string;
  reservedAt: string;
};

export default function AdminTutoringPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sessionsResponse, bookingsResponse] = await Promise.all([
        apiFetchAuth<Session[]>('/gateway/admin/tutoring/sessions'),
        apiFetchAuth<Booking[]>('/gateway/admin/tutoring/bookings'),
      ]);
      setSessions(sessionsResponse || []);
      setBookings(bookingsResponse || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar tutorías.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardShell title="Administración" requiredRoles={['ADMIN']} navItems={adminNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Tutorías (Sesiones)</h2>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[var(--ink-muted)]">
                <tr>
                  <th className="py-3">Docente</th>
                  <th className="py-3">Curso</th>
                  <th className="py-3">Horario</th>
                  <th className="py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-[var(--ink-muted)]">Cargando...</td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-[var(--ink-muted)]">No hay sesiones.</td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session.id} className="border-t border-[var(--border)]">
                      <td className="py-3">
                        <div className="font-semibold">{session.teacherId}</div>
                        <div className="text-xs text-[var(--ink-muted)]">{session.id}</div>
                      </td>
                      <td className="py-3">{session.courseId || 'General'}</td>
                      <td className="py-3">
                        {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}
                      </td>
                      <td className="py-3">{session.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Reservas</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[var(--ink-muted)]">
                <tr>
                  <th className="py-3">Estudiante</th>
                  <th className="py-3">Sesión</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-[var(--ink-muted)]">Cargando...</td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-[var(--ink-muted)]">No hay reservas.</td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-[var(--border)]">
                      <td className="py-3">{booking.studentId}</td>
                      <td className="py-3">{booking.tutoringSessionId}</td>
                      <td className="py-3">{booking.status}</td>
                      <td className="py-3">{new Date(booking.reservedAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
