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
  const [editingSlot, setEditingSlot] = useState<Availability | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [timeError, setTimeError] = useState('');

  const courseLabel = (courseId?: string | null) => {
    if (!courseId) {
      return 'General';
    }
    const course = courses.find((item) => item.id === courseId);
    return course ? `${course.code} · ${course.name}` : courseId;
  };

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
    setTimeError('');
    try {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        setTimeError('Ingresa una fecha y hora valida.');
        return;
      }
      if (start >= end) {
        setTimeError('La hora de inicio debe ser menor que la hora de fin.');
        return;
      }
      const payload = {
        teacherId: profile?.id,
        courseId: formData.courseId || undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        timezone: formData.timezone,
        status: formData.status,
      };

      if (editingSlot) {
        await apiFetchAuth(`/gateway/schedule/availability/${editingSlot.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            courseId: payload.courseId,
            startTime: payload.startTime,
            endTime: payload.endTime,
            timezone: payload.timezone,
            status: payload.status,
          }),
        });
      } else {
        await apiFetchAuth('/gateway/schedule/availability', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setFormData({ courseId: '', startTime: '', endTime: '', timezone: 'America/Guayaquil', status: 'AVAILABLE' });
      setEditingSlot(null);
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
          <h2 className="text-xl font-semibold">{editingSlot ? 'Editar disponibilidad' : 'Crear disponibilidad'}</h2>
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
              {editingSlot ? 'Actualizar' : 'Guardar'}
            </button>
            {editingSlot && (
              <button
                className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-semibold md:col-span-2"
                type="button"
                onClick={() => {
                  setEditingSlot(null);
                  setFormData({ courseId: '', startTime: '', endTime: '', timezone: 'America/Guayaquil', status: 'AVAILABLE' });
                }}
              >
                Cancelar
              </button>
            )}
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {timeError && <p className="mt-3 text-sm text-red-600">{timeError}</p>}
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
                      <p className="text-xs text-[var(--ink-muted)]">{courseLabel(slot.courseId)} · {slot.status}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                        onClick={() => {
                          setEditingSlot(slot);
                          setFormData({
                            courseId: slot.courseId || '',
                            startTime: slot.startTime.slice(0, 16),
                            endTime: slot.endTime.slice(0, 16),
                            timezone: slot.timezone,
                            status: slot.status,
                          });
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                        onClick={() => handleDelete(slot.id)}
                      >
                        Eliminar
                      </button>
                    </div>
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
