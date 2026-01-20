'use client';

import { FormEvent, useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { studentNav } from '../../../../lib/nav';
import { useProfile } from '../../../../hooks/useProfile';

type Material = {
  id: string;
  title: string;
  type: string;
  resourceUrl: string;
  status: string;
};

type Enrollment = {
  id: string;
  status: string;
  course: { id: string; code: string; name: string } | null;
};

export default function StudentMaterialsPage() {
  const { profile } = useProfile();
  const [courseId, setCourseId] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      if (!profile?.id) {
        setLoadingCourses(false);
        return;
      }
      try {
        const response = await apiFetchAuth<{ enrollments: Enrollment[] }>(`/gateway/search/enrollments/${profile.id}`);
        setCourses(response.enrollments || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudieron cargar cursos.';
        setError(message);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, [profile?.id]);

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const response = await apiFetchAuth<Material[]>(`/gateway/materials?courseId=${courseId}`);
      setMaterials(response || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar materiales.';
      setError(message);
    }
  };

  return (
    <DashboardShell title="Estudiante" requiredRoles={['STUDENT']} navItems={studentNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Materiales por curso</h2>
          <form onSubmit={handleSearch} className="mt-4 flex flex-wrap gap-3">
            <select
              className="flex-1 rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              required
            >
              <option value="">Selecciona curso</option>
              {loadingCourses ? (
                <option value="" disabled>
                  Cargando cursos...
                </option>
              ) : (
                courses
                  .filter((enrollment) => enrollment.course)
                  .map((enrollment) => (
                    <option key={enrollment.id} value={enrollment.course?.id || ''}>
                      {enrollment.course?.code} · {enrollment.course?.name}
                    </option>
                  ))
              )}
            </select>
            <button className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white">
              Buscar
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Resultados</h3>
          <div className="mt-4 grid gap-3">
            {materials.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">No hay materiales disponibles.</p>
            ) : (
              materials.map((material) => (
                <div key={material.id} className="rounded-2xl border border-[var(--border)] px-4 py-3">
                  <p className="text-sm font-semibold">{material.title}</p>
                  <p className="text-xs text-[var(--ink-muted)]">{material.type} · {material.status}</p>
                  <a className="mt-2 inline-block text-sm text-[var(--primary)] hover:underline" href={material.resourceUrl} target="_blank" rel="noreferrer">
                    Abrir recurso
                  </a>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
