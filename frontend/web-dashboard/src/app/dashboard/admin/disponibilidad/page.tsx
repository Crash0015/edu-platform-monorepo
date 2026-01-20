'use client';

import { FormEvent, useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { adminNav } from '../../../../lib/nav';

type Availability = {
  id: string;
  teacherId: string;
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

type AdminUser = {
  id: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED';
  userType: 'STUDENT' | 'TEACHER' | 'ADMIN';
};

type AdminUserList = {
  items: AdminUser[];
};

export default function AdminAvailabilityPage() {
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    teacherId: '',
    courseId: '',
    startTime: '',
    endTime: '',
    timezone: 'America/Guayaquil',
    status: 'AVAILABLE',
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<AdminUser[]>([]);

  const loadAvailability = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetchAuth<Availability[]>('/gateway/admin/schedule/availability');
      setSlots(response || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar disponibilidad.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
    const loadOptions = async () => {
      try {
        const [coursesResponse, teachersResponse] = await Promise.all([
          apiFetchAuth<Course[]>('/gateway/admin/courses'),
          apiFetchAuth<AdminUserList>('/gateway/admin/users?userType=TEACHER&status=ACTIVE&limit=100'),
        ]);
        setCourses(coursesResponse || []);
        setTeachers(teachersResponse.items || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudieron cargar opciones.';
        setError(message);
      }
    };
    loadOptions();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await apiFetchAuth('/gateway/admin/schedule/availability', {
        method: 'POST',
        body: JSON.stringify({
          teacherId: formData.teacherId,
          courseId: formData.courseId || undefined,
          startTime: formData.startTime,
          endTime: formData.endTime,
          timezone: formData.timezone,
          status: formData.status,
        }),
      });
      setFormData({ teacherId: '', courseId: '', startTime: '', endTime: '', timezone: 'America/Guayaquil', status: 'AVAILABLE' });
      loadAvailability();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear la disponibilidad.';
      setError(message);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await apiFetchAuth(`/gateway/schedule/availability/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    loadAvailability();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar disponibilidad?')) {
      return;
    }
    await apiFetchAuth(`/gateway/schedule/availability/${id}`, { method: 'DELETE' });
    loadAvailability();
  };

  return (
    <DashboardShell title="Administración" requiredRoles={['ADMIN']} navItems={adminNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Disponibilidad docente</h2>
          <p className="text-sm text-[var(--ink-muted)]">Crea y administra horarios de tutorías.</p>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-2">
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={formData.teacherId}
              onChange={(event) => setFormData({ ...formData, teacherId: event.target.value })}
              required
            >
              <option value="">Selecciona docente</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.email}
                </option>
              ))}
            </select>
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
              placeholder="Zona horaria"
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
              Guardar disponibilidad
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Slots registrados</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[var(--ink-muted)]">
                <tr>
                  <th className="py-3">Docente</th>
                  <th className="py-3">Curso</th>
                  <th className="py-3">Horario</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-[var(--ink-muted)]">
                      Cargando disponibilidad...
                    </td>
                  </tr>
                ) : slots.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-[var(--ink-muted)]">
                      No hay slots.
                    </td>
                  </tr>
                ) : (
                  slots.map((slot) => (
                    <tr key={slot.id} className="border-t border-[var(--border)]">
                      <td className="py-3">
                        <div className="font-semibold">{slot.teacherId}</div>
                        <div className="text-xs text-[var(--ink-muted)]">{slot.id}</div>
                      </td>
                      <td className="py-3">{slot.courseId || 'General'}</td>
                      <td className="py-3">
                        {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                      </td>
                      <td className="py-3">{slot.status}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                            onClick={() => updateStatus(slot.id, slot.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE')}
                          >
                            {slot.status === 'AVAILABLE' ? 'Bloquear' : 'Activar'}
                          </button>
                          <button
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                            onClick={() => handleDelete(slot.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
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
