'use client';

import { FormEvent, useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth, apiFetchAuthForm } from '../../../../lib/api';
import { teacherNav } from '../../../../lib/nav';
import { useProfile } from '../../../../hooks/useProfile';

type Material = {
  id: string;
  title: string;
  courseId: string;
  type: string;
  status: string;
  resourceUrl: string;
  description?: string | null;
  thumbnailUrl?: string | null;
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
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState('');
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [editing, setEditing] = useState<Material | null>(null);

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
      let resourceUrl = formData.resourceUrl;
      let thumbnailUrl = thumbnail || undefined;

      if (formData.type === 'PDF' && file) {
        const data = new FormData();
        data.append('file', file);
        const uploadResponse = await apiFetchAuthForm<{ url: string }>('/gateway/materials/uploads', data);
        resourceUrl = uploadResponse.url;
      }

      const payload = {
        title: formData.title,
        courseId: formData.courseId,
        type: formData.type,
        resourceUrl,
        description: formData.description || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
      };
      if (editing) {
        await apiFetchAuth(`/gateway/materials/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetchAuth('/gateway/materials', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setFormData({ title: '', courseId: '', type: 'PDF', resourceUrl: '', description: '' });
      setFile(null);
      setThumbnail('');
      setEditing(null);
      loadMaterials();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear el material.';
      setError(message);
    }
  };

  const handleEdit = (material: Material) => {
    setEditing(material);
    setFormData({
      title: material.title,
      courseId: material.courseId,
      type: material.type,
      resourceUrl: material.resourceUrl,
      description: material.description || '',
    });
    setThumbnail(material.thumbnailUrl || '');
    setFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar material?')) {
      return;
    }
    await apiFetchAuth(`/gateway/materials/${id}`, { method: 'DELETE' });
    loadMaterials();
  };

  const handlePublish = async (id: string) => {
    await apiFetchAuth(`/gateway/materials/${id}/publish`, { method: 'POST' });
    loadMaterials();
  };

  return (
    <DashboardShell title="Docente" requiredRoles={['TEACHER']} navItems={teacherNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">{editing ? 'Editar material' : 'Publicar material'}</h2>
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
            {formData.type === 'PDF' ? (
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm md:col-span-2"
                type="file"
                accept="application/pdf"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                required={!editing}
              />
            ) : (
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm md:col-span-2"
                placeholder="URL del recurso"
                value={formData.resourceUrl}
                onChange={(event) => setFormData({ ...formData, resourceUrl: event.target.value })}
                required
              />
            )}
            {formData.type === 'VIDEO' && (
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm md:col-span-2"
                placeholder="URL de miniatura (opcional)"
                value={thumbnail}
                onChange={(event) => setThumbnail(event.target.value)}
              />
            )}
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm md:col-span-2"
              placeholder="Descripción (opcional)"
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            />
            <div className="flex gap-3 md:col-span-2">
              <button className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white" type="submit">
                {editing ? 'Actualizar' : 'Guardar material'}
              </button>
              {editing && (
                <button
                  className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-semibold"
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setFormData({ title: '', courseId: '', type: 'PDF', resourceUrl: '', description: '' });
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">{material.status}</span>
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
