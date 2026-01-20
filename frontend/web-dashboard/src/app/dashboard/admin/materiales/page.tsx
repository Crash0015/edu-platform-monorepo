'use client';

import { FormEvent, useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { adminNav } from '../../../../lib/nav';

type Material = {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  type: string;
  status: string;
  resourceUrl: string;
  thumbnailUrl: string | null;
  durationMinutes: number | null;
};

type Course = {
  id: string;
  code: string;
  name: string;
};

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ courseId: '', status: '', type: '' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    type: 'PDF',
    resourceUrl: '',
    thumbnailUrl: '',
    durationMinutes: '',
  });
  const [courses, setCourses] = useState<Course[]>([]);

  const loadMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.courseId) params.set('courseId', filters.courseId);
      if (filters.status) params.set('status', filters.status);
      if (filters.type) params.set('type', filters.type);
      const response = await apiFetchAuth<Material[]>(`/gateway/admin/materials?${params.toString()}`);
      setMaterials(response || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar materiales.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
    const loadCourses = async () => {
      try {
        const response = await apiFetchAuth<Course[]>('/gateway/admin/courses');
        setCourses(response || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudieron cargar cursos.';
        setError(message);
      }
    };
    loadCourses();
  }, []);

  const handleFilter = (event: FormEvent) => {
    event.preventDefault();
    loadMaterials();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      courseId: formData.courseId,
      type: formData.type,
      resourceUrl: formData.resourceUrl,
      thumbnailUrl: formData.thumbnailUrl || undefined,
      durationMinutes: formData.durationMinutes ? Number(formData.durationMinutes) : undefined,
    };
    try {
      if (editing) {
        await apiFetchAuth(`/gateway/admin/materials/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetchAuth('/gateway/admin/materials', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ title: '', description: '', courseId: '', type: 'PDF', resourceUrl: '', thumbnailUrl: '', durationMinutes: '' });
      loadMaterials();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el material.';
      setError(message);
    }
  };

  const handleEdit = (material: Material) => {
    setEditing(material);
    setShowForm(true);
    setFormData({
      title: material.title,
      description: material.description || '',
      courseId: material.courseId,
      type: material.type,
      resourceUrl: material.resourceUrl,
      thumbnailUrl: material.thumbnailUrl || '',
      durationMinutes: material.durationMinutes ? String(material.durationMinutes) : '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar material?')) {
      return;
    }
    await apiFetchAuth(`/gateway/admin/materials/${id}`, { method: 'DELETE' });
    loadMaterials();
  };

  const handlePublish = async (id: string) => {
    await apiFetchAuth(`/gateway/admin/materials/${id}/publish`, { method: 'POST' });
    loadMaterials();
  };

  return (
    <DashboardShell title="Administración" requiredRoles={['ADMIN']} navItems={adminNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Materiales</h2>
              <p className="text-sm text-[var(--ink-muted)]">Publica recursos por curso y controla su estado.</p>
            </div>
            <button
              className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white"
              onClick={() => {
                setShowForm(true);
                setEditing(null);
                setFormData({ title: '', description: '', courseId: '', type: 'PDF', resourceUrl: '', thumbnailUrl: '', durationMinutes: '' });
              }}
            >
              Nuevo material
            </button>
          </div>
          <form onSubmit={handleFilter} className="mt-6 grid gap-3 md:grid-cols-[1.2fr_0.6fr_0.6fr_auto]">
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
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
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            >
              <option value="">Estado</option>
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Archivado</option>
            </select>
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={filters.type}
              onChange={(event) => setFilters({ ...filters, type: event.target.value })}
            >
              <option value="">Tipo</option>
              <option value="PDF">PDF</option>
              <option value="VIDEO">Video</option>
              <option value="LINK">Enlace</option>
            </select>
            <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
              Filtrar
            </button>
          </form>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </section>

        {showForm && (
          <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">{editing ? 'Editar material' : 'Crear material'}</h3>
            <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm md:col-span-2"
                placeholder="Título"
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                required
              />
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm md:col-span-2"
                placeholder="Descripción"
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
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
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                placeholder="URL de portada (opcional)"
                value={formData.thumbnailUrl}
                onChange={(event) => setFormData({ ...formData, thumbnailUrl: event.target.value })}
              />
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                placeholder="Duración (min)"
                type="number"
                min={1}
                value={formData.durationMinutes}
                onChange={(event) => setFormData({ ...formData, durationMinutes: event.target.value })}
              />
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[var(--ink-muted)]">
                <tr>
                  <th className="py-3">Título</th>
                  <th className="py-3">Curso</th>
                  <th className="py-3">Tipo</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-[var(--ink-muted)]">
                      Cargando materiales...
                    </td>
                  </tr>
                ) : materials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-[var(--ink-muted)]">
                      No hay materiales.
                    </td>
                  </tr>
                ) : (
                  materials.map((material) => (
                    <tr key={material.id} className="border-t border-[var(--border)]">
                      <td className="py-3">
                        <div className="font-semibold">{material.title}</div>
                        <div className="text-xs text-[var(--ink-muted)]">{material.id}</div>
                      </td>
                      <td className="py-3">{material.courseId}</td>
                      <td className="py-3">{material.type}</td>
                      <td className="py-3">{material.status}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                            onClick={() => handleEdit(material)}
                          >
                            Editar
                          </button>
                          <button
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                            onClick={() => handleDelete(material.id)}
                          >
                            Eliminar
                          </button>
                          <button
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                            onClick={() => handlePublish(material.id)}
                          >
                            Publicar
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
