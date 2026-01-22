'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { studentNav } from '../../../../lib/nav';
import { useProfile } from '../../../../hooks/useProfile';

type Enrollment = {
  id?: string;
  courseId: string;
  status: string;
  course: { code: string; name: string; description: string | null } | null;
};

export default function StudentCoursesPage() {
  const { profile } = useProfile();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) {
        return;
      }
      const response = await apiFetchAuth<{ enrollments: Enrollment[] }>(`/gateway/search/enrollments/${profile.id}`);
      setEnrollments(response.enrollments || []);
    };
    load();
  }, [profile?.id]);

  return (
    <DashboardShell title="Estudiante" requiredRoles={['STUDENT']} navItems={studentNav}>
      <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Mis cursos</h2>
        <div className="mt-4 grid gap-3">
          {enrollments.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">Aún no tienes cursos inscritos.</p>
          ) : (
            enrollments.map((enrollment) => (
              <div key={enrollment.courseId} className="rounded-2xl border border-[var(--border)] px-4 py-3">
                <p className="text-sm font-semibold">{enrollment.course?.name || 'Curso'}</p>
                <p className="text-xs text-[var(--ink-muted)]">
                  {enrollment.course?.code} · {enrollment.status}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
