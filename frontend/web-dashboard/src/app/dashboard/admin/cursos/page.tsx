'use client';

import { FormEvent, useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { adminNav } from '../../../../lib/nav';

type Course = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  capacity: number;
  seatsTaken: number;
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

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', description: '', capacity: 30, status: 'ACTIVE' });
  const [assignData, setAssignData] = useState({ courseId: '', teacherId: '', roleInCourse: 'OWNER' });
  const [teachers, setTeachers] = useState<AdminUser[]>([]);

  const loadCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetchAuth<Course[]>('/gateway/admin/courses');
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
    const loadTeachers = async () => {
      try {
        const response = await apiFetchAuth<AdminUserList>('/gateway/admin/users?userType=TEACHER&status=ACTIVE&limit=100');
        setTeachers(response.items || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudieron cargar docentes.';
        setError(message);
      }
    };
    loadTeachers();
  }, []);

  const handleCreateOrUpdate = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      if (editing) {
        await apiFetchAuth(`/gateway/admin/courses/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            capacity: Number(formData.capacity),
            status: formData.status,
          }),
        });
      } else {
        await apiFetchAuth('/gateway/admin/courses', {
          method: 'POST',
          body: JSON.stringify({
            code: formData.code,
            name: formData.name,
            description: formData.description || undefined,
            capacity: Number(formData.capacity),
          }),
        });
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ code: '', name: '', description: '', capacity: 30, status: 'ACTIVE' });
      loadCourses();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el curso.';
      setError(message);
    }
  };

  const handleEdit = (course: Course) => {
    setEditing(course);
    setShowForm(true);
    setFormData({
      code: course.code,
      name: course.name,
      description: course.description || '',
      capacity: course.capacity,
      status: course.status,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar curso?')) {
      return;
    }
    await apiFetchAuth(`/gateway/admin/courses/${id}`, { method: 'DELETE' });
    loadCourses();
  };

  const handleAssign = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await apiFetchAuth('/gateway/courses/teachers/assign', {
        method: 'POST',
        body: JSON.stringify({
          courseId: assignData.courseId,
          teacherId: assignData.teacherId,
          roleInCourse: assignData.roleInCourse,
        }),
      });
      setAssignData({ courseId: '', teacherId: '', roleInCourse: 'OWNER' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo asignar el docente.';
      setError(message);
    }
  };

  const adjustSeats = async (courseId: string, delta: 'increment' | 'decrement') => {
    await apiFetchAuth(`/gateway/courses/${courseId}/seats/${delta}`, { method: 'POST' });
    loadCourses();
  };

  return (
    <DashboardShell title="Administración" requiredRoles={['ADMIN']} navItems={adminNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Cursos</h2>
              <p className="text-sm text-[var(--ink-muted)]">Crear, actualizar y asignar docentes.</p>
            </div>
            <button
              className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white"
              onClick={() => {
                setShowForm(true);
                setEditing(null);
                setFormData({ code: '', name: '', description: '', capacity: 30, status: 'ACTIVE' });
              }}
            >
              Nuevo curso
            </button>
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </section>

        {showForm && (
          <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">{editing ? 'Editar curso' : 'Crear curso'}</h3>
            <form onSubmit={handleCreateOrUpdate} className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                placeholder="Código (MAT-101)"
                value={formData.code}
                onChange={(event) => setFormData({ ...formData, code: event.target.value })}
                required
                disabled={!!editing}
              />
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                placeholder="Nombre"
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
              <select
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value })}
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="OPEN">Abierto</option>
                <option value="CLOSED">Cerrado</option>
              </select>
              <div className="flex gap-3 md:col-span-2">
                <button className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white" type="submit">
                  Guardar
                </button>
                <button
                  className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-semibold"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Asignar docente</h3>
          <form onSubmit={handleAssign} className="mt-4 grid gap-4 md:grid-cols-3">
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={assignData.courseId}
              onChange={(event) => setAssignData({ ...assignData, courseId: event.target.value })}
              required
            >
              <option value="">Selecciona curso</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} · {course.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={assignData.teacherId}
              onChange={(event) => setAssignData({ ...assignData, teacherId: event.target.value })}
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
              value={assignData.roleInCourse}
              onChange={(event) => setAssignData({ ...assignData, roleInCourse: event.target.value })}
            >
              <option value="OWNER">Owner</option>
              <option value="ASSISTANT">Assistant</option>
            </select>
            <button className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white md:col-span-3">
              Asignar docente
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[var(--ink-muted)]">
                <tr>
                  <th className="py-3">Código</th>
                  <th className="py-3">Nombre</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3">Cupos</th>
                  <th className="py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-4 text-[var(--ink-muted)]" colSpan={5}>
                      Cargando cursos...
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td className="py-4 text-[var(--ink-muted)]" colSpan={5}>
                      No hay cursos registrados.
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="border-t border-[var(--border)]">
                      <td className="py-3">
                        <div className="font-semibold">{course.code}</div>
                        <div className="text-xs text-[var(--ink-muted)]">{course.id}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-semibold">{course.name}</div>
                        <div className="text-xs text-[var(--ink-muted)]">{course.description || 'Sin descripción'}</div>
                      </td>
                      <td className="py-3">{course.status}</td>
                      <td className="py-3">
                        {course.seatsTaken}/{course.capacity}
                      </td>
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
                          <button
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                            onClick={() => adjustSeats(course.id, 'increment')}
                          >
                            +Cupo
                          </button>
                          <button
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                            onClick={() => adjustSeats(course.id, 'decrement')}
                          >
                            -Cupo
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
