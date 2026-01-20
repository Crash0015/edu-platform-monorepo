'use client';

import { FormEvent, useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { teacherNav } from '../../../../lib/nav';
import { useProfile } from '../../../../hooks/useProfile';

type Availability = {
  id: string;
  courseId: string | null;
  startTime: string;
  endTime: string;
  timezone: string;
  status: string;
};

type Course = {
  id: string;
  code: string;
  name: string;
};

export default function TeacherAvailabilityPage() {
  const { profile } = useProfile();
  const [slots, setSlots] = useState<Availability[]>([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ courseId: '', startTime: '', endTime: '', timezone: 'America/Guayaquil', status: 'AVAILABLE' });
  const [courses, setCourses] = useState<Course[]>([]);

  const loadAvailability = async () => {
    if (!profile?.id) {
      return;
    }
    const response = await apiFetchAuth<Availability[]>(`/gateway/schedule/availability/teacher/${profile.id}`);
    setSlots(response || []);
  };

  useEffect(() => {
    loadAvailability();
  }, [profile?.id]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        if (!profile?.id) {
          return;
        }
        const response = await apiFetchAuth<Course[]>(`/gateway/courses/teachers/${profile.id}`);
        setCourses(response || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudieron cargar cursos.';
        setError(message);
      }
    };
    loadCourses();
  }, [profile?.id]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await apiFetchAuth('/gateway/schedule/availability', {
        method: 'POST',
        body: JSON.stringify({
          teacherId: profile?.id,
          courseId: formData.courseId || undefined,
          startTime: formData.startTime,
          endTime: formData.endTime,
          timezone: formData.timezone,
          status: formData.status,
        }),
      });
      setFormData({ courseId: '', startTime: '', endTime: '', timezone: 'America/Guayaquil', status: 'AVAILABLE' });
      loadAvailability();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar disponibilidad.';
      setError(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar slot?')) {
      return;
    }
    await apiFetchAuth(`/gateway/schedule/availability/${id}`, { method: 'DELETE' });
    loadAvailability();
  };

  return (
    <DashboardShell title="Docente" requiredRoles={['TEACHER']} navItems={teacherNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Crear disponibilidad</h2>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-2">
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={formData.courseId}
              onChange={(event) => setFormData({ ...formData, courseId: event.target.value })}
            >
              <option value="">Curso (opcional)</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} · {course.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              type="datetime-local"
              value={formData.startTime}
              onChange={(event) => setFormData({ ...formData, startTime: event.target.value })}
              required
            />
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              type="datetime-local"
              value={formData.endTime}
              onChange={(event) => setFormData({ ...formData, endTime: event.target.value })}
              required
            />
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={formData.timezone}
              onChange={(event) => setFormData({ ...formData, timezone: event.target.value })}
              required
            />
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={formData.status}
              onChange={(event) => setFormData({ ...formData, status: event.target.value })}
            >
              <option value="AVAILABLE">Disponible</option>
              <option value="BLOCKED">Bloqueado</option>
            </select>
            <button className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white md:col-span-2">
              Guardar
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Mis slots</h2>
          <div className="mt-4 grid gap-3">
            {slots.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">No hay disponibilidad registrada.</p>
            ) : (
              slots.map((slot) => (
                <div key={slot.id} className="rounded-2xl border border-[var(--border)] px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}</p>
                      <p className="text-xs text-[var(--ink-muted)]">{slot.courseId || 'General'} · {slot.status}</p>
                    </div>
                    <button
                      className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                      onClick={() => handleDelete(slot.id)}
                    >
                      Eliminar
                    </button>
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
