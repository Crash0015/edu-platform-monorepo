'use client';

import { FormEvent, useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { teacherNav } from '../../../../lib/nav';
import { useProfile } from '../../../../hooks/useProfile';

type Material = {
  id: string;
  title: string;
  courseId: string;
  type: string;
  status: string;
  resourceUrl: string;
};

type Course = {
  id: string;
  code: string;
  name: string;
};

export default function TeacherMaterialsPage() {
  const { profile } = useProfile();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filters, setFilters] = useState({ courseId: '', status: '' });
  const [formData, setFormData] = useState({ title: '', courseId: '', type: 'PDF', resourceUrl: '', description: '' });
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);

  const loadMaterials = async () => {
    const params = new URLSearchParams();
    if (filters.courseId) params.set('courseId', filters.courseId);
    if (filters.status) params.set('status', filters.status);
    const response = await apiFetchAuth<Material[]>(`/gateway/materials?${params.toString()}`);
    setMaterials(response || []);
  };

  useEffect(() => {
    loadMaterials();
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
      await apiFetchAuth('/gateway/materials', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          courseId: formData.courseId,
          type: formData.type,
          resourceUrl: formData.resourceUrl,
          description: formData.description || undefined,
        }),
      });
      setFormData({ title: '', courseId: '', type: 'PDF', resourceUrl: '', description: '' });
      loadMaterials();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear el material.';
      setError(message);
    }
  };

  return (
    <DashboardShell title="Docente" requiredRoles={['TEACHER']} navItems={teacherNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Publicar material</h2>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm md:col-span-2"
              placeholder="Título"
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              required
            />
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={formData.courseId}
              onChange={(event) => setFormData({ ...formData, courseId: event.target.value })}
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
              value={formData.type}
              onChange={(event) => setFormData({ ...formData, type: event.target.value })}
            >
              <option value="PDF">PDF</option>
              <option value="VIDEO">Video</option>
              <option value="LINK">Enlace</option>
            </select>
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm md:col-span-2"
              placeholder="URL del recurso"
              value={formData.resourceUrl}
              onChange={(event) => setFormData({ ...formData, resourceUrl: event.target.value })}
              required
            />
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm md:col-span-2"
              placeholder="Descripción (opcional)"
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            />
            <button className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white md:col-span-2">
              Guardar material
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Materiales publicados</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                loadMaterials();
              }}
              className="flex flex-wrap gap-2"
            >
              <select
                className="rounded-2xl border border-[var(--border)] px-3 py-2 text-sm"
                value={filters.courseId}
                onChange={(event) => setFilters({ ...filters, courseId: event.target.value })}
              >
                <option value="">Todos los cursos</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} · {course.name}
                  </option>
                ))}
              </select>
              <select
                className="rounded-2xl border border-[var(--border)] px-3 py-2 text-sm"
                value={filters.status}
                onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              >
                <option value="">Estado</option>
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
              <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">Filtrar</button>
            </form>
          </div>
          <div className="mt-4 grid gap-3">
            {materials.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">No hay materiales para mostrar.</p>
            ) : (
              materials.map((material) => (
                <div key={material.id} className="rounded-2xl border border-[var(--border)] px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{material.title}</p>
                      <p className="text-xs text-[var(--ink-muted)]">{material.courseId} · {material.type}</p>
                    </div>
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">{material.status}</span>
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
