'use client';

import { FormEvent, useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { teacherNav } from '../../../../lib/nav';
import { useProfile } from '../../../../hooks/useProfile';

type Course = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  capacity: number;
  seatsTaken: number;
};

export default function TeacherCoursesPage() {
  const { profile } = useProfile();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ code: '', name: '', description: '', capacity: 30 });
  const [editing, setEditing] = useState<Course | null>(null);

  const loadCourses = async () => {
    if (!profile?.id) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await apiFetchAuth<Course[]>(`/gateway/courses/teachers/${profile.id}`);
      setCourses(response || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar cursos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [profile?.id]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile?.id) {
      return;
    }
    try {
      if (editing) {
        await apiFetchAuth(`/gateway/courses/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || undefined,
            capacity: Number(formData.capacity),
            status: editing.status,
          }),
        });
      } else {
        const course = await apiFetchAuth<Course>('/gateway/courses', {
          method: 'POST',
          body: JSON.stringify({
            code: formData.code,
            name: formData.name,
            description: formData.description || undefined,
            capacity: Number(formData.capacity),
          }),
        });
        await apiFetchAuth('/gateway/courses/teachers/assign', {
          method: 'POST',
          body: JSON.stringify({ courseId: course.id, teacherId: profile.id, roleInCourse: 'OWNER' }),
        });
      }
      setFormData({ code: '', name: '', description: '', capacity: 30 });
      setEditing(null);
      loadCourses();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear el curso.';
      setError(message);
    }
  };

  const handleEdit = (course: Course) => {
    setEditing(course);
    setFormData({
      code: course.code,
      name: course.name,
      description: course.description || '',
      capacity: course.capacity,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar curso?')) {
      return;
    }
    await apiFetchAuth(`/gateway/courses/${id}`, { method: 'DELETE' });
    loadCourses();
  };

  return (
    <DashboardShell title="Docente" requiredRoles={['TEACHER']} navItems={teacherNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">{editing ? 'Editar curso' : 'Crear curso'}</h2>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              placeholder="Código (ADM-101)"
              value={formData.code}
              onChange={(event) => setFormData({ ...formData, code: event.target.value })}
              required
              disabled={!!editing}
            />
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              placeholder="Nombre del curso"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              required
            />
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm md:col-span-2"
              placeholder="Descripción"
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            />
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              type="number"
              min={1}
              value={formData.capacity}
              onChange={(event) => setFormData({ ...formData, capacity: Number(event.target.value) })}
            />
            <div className="flex gap-3 md:col-span-2">
              <button className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white" type="submit">
                {editing ? 'Actualizar' : 'Guardar curso'}
              </button>
              {editing && (
                <button
                  className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-semibold"
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setFormData({ code: '', name: '', description: '', capacity: 30 });
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Mis cursos</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[var(--ink-muted)]">
                <tr>
                  <th className="py-3">Curso</th>
                  <th className="py-3">Cupos</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-[var(--ink-muted)]">Cargando...</td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-[var(--ink-muted)]">No tienes cursos asignados.</td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="border-t border-[var(--border)]">
                      <td className="py-3">
                        <div className="font-semibold">{course.name}</div>
                        <div className="text-xs text-[var(--ink-muted)]">{course.code}</div>
                      </td>
                      <td className="py-3">{course.seatsTaken}/{course.capacity}</td>
                      <td className="py-3">{course.status}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                            onClick={() => handleEdit(course)}
                          >
                            Editar
                          </button>
                          <button
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                            onClick={() => handleDelete(course.id)}
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
