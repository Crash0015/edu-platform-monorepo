'use client';

import { FormEvent, useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { teacherNav } from '../../../../lib/nav';
import { useProfile } from '../../../../hooks/useProfile';

type Enrollment = {
  id: string;
  studentId: string;
  status: string;
  student?: { email: string } | null;
};

type Course = {
  id: string;
  code: string;
  name: string;
};

export default function TeacherStudentsPage() {
  const { profile } = useProfile();
  const [assignData, setAssignData] = useState({ studentId: '', courseId: '' });
  const [courseId, setCourseId] = useState('');
  const [students, setStudents] = useState<Enrollment[]>([]);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      if (!profile?.id) {
        return;
      }
      try {
        const coursesResponse = await apiFetchAuth<Course[]>(`/gateway/courses/teachers/${profile.id}`);
        setCourses(coursesResponse || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudieron cargar opciones.';
        setError(message);
      }
    };
    loadOptions();
  }, [profile?.id]);

  const handleAssign = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await apiFetchAuth('/gateway/enrollments/assign', {
        method: 'POST',
        body: JSON.stringify(assignData),
      });
      setAssignData({ studentId: '', courseId: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo matricular.';
      setError(message);
    }
  };

  const handleLoadStudents = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const response = await apiFetchAuth<Enrollment[]>(`/gateway/enrollments/courses/${courseId}`);
      setStudents(response || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar estudiantes.';
      setError(message);
    }
  };

  return (
    <DashboardShell title="Docente" requiredRoles={['TEACHER']} navItems={teacherNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Matricular estudiante</h2>
          <form onSubmit={handleAssign} className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              placeholder="ID del estudiante"
              value={assignData.studentId}
              onChange={(event) => setAssignData({ ...assignData, studentId: event.target.value })}
              required
            />
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
            <button className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white md:col-span-2">
              Matricular
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Estudiantes por curso</h2>
          <form onSubmit={handleLoadStudents} className="mt-4 flex flex-wrap gap-3">
            <select
              className="flex-1 rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              required
            >
              <option value="">Selecciona curso</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} · {course.name}
                </option>
              ))}
            </select>
            <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
              Consultar
            </button>
          </form>
          <div className="mt-4">
            {students.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">Sin estudiantes para mostrar.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {students.map((student) => (
                  <li key={student.id} className="rounded-2xl border border-[var(--border)] px-4 py-2">
                    {student.student?.email || student.studentId} · {student.status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
