'use client';

import { FormEvent, useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { adminNav } from '../../../../lib/nav';

type Enrollment = {
  id: string;
  studentId: string;
  courseId: string;
  status: string;
  enrolledAt: string;
  course?: { code: string; name: string } | null;
  student?: { email: string } | null;
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

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignData, setAssignData] = useState({ studentId: '', courseId: '' });
  const [courseLookup, setCourseLookup] = useState('');
  const [studentLookup, setStudentLookup] = useState('');
  const [lookupResult, setLookupResult] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<AdminUser[]>([]);

  const loadEnrollments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetchAuth<Enrollment[]>('/gateway/admin/enrollments');
      setEnrollments(response || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar matrículas.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
    const loadOptions = async () => {
      try {
        const [coursesResponse, studentsResponse] = await Promise.all([
          apiFetchAuth<Course[]>('/gateway/admin/courses'),
          apiFetchAuth<AdminUserList>('/gateway/admin/users?userType=STUDENT&status=ACTIVE&limit=100'),
        ]);
        setCourses(coursesResponse || []);
        setStudents(studentsResponse.items || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudieron cargar opciones.';
        setError(message);
      }
    };
    loadOptions();
  }, []);

  const handleAssign = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await apiFetchAuth('/gateway/admin/enrollments/assign', {
        method: 'POST',
        body: JSON.stringify(assignData),
      });
      setAssignData({ studentId: '', courseId: '' });
      loadEnrollments();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo matricular.';
      setError(message);
    }
  };

  const handleLookupByCourse = async (event: FormEvent) => {
    event.preventDefault();
    const response = await apiFetchAuth<Enrollment[]>(`/gateway/enrollments/courses/${courseLookup}`);
    setLookupResult(response || []);
  };

  const handleLookupByStudent = async (event: FormEvent) => {
    event.preventDefault();
    const response = await apiFetchAuth<Enrollment[]>(`/gateway/enrollments/students/${studentLookup}`);
    setLookupResult(response || []);
  };

  const handleDropEnrollment = async (enrollmentId: string) => {
    if (!confirm('¿Eliminar matrícula?')) {
      return;
    }
    await apiFetchAuth(`/gateway/admin/enrollments/${enrollmentId}`, { method: 'DELETE' });
    loadEnrollments();
  };

  return (
    <DashboardShell title="Administración" requiredRoles={['ADMIN']} navItems={adminNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Asignar matrícula</h2>
          <form onSubmit={handleAssign} className="mt-4 grid gap-4 md:grid-cols-2">
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={assignData.studentId}
              onChange={(event) => setAssignData({ ...assignData, studentId: event.target.value })}
              required
            >
              <option value="">Selecciona estudiante</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.email}
                </option>
              ))}
            </select>
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
              Matricular estudiante
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Consultar matrículas</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <form onSubmit={handleLookupByCourse} className="flex gap-3">
              <select
                className="flex-1 rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                value={courseLookup}
                onChange={(event) => setCourseLookup(event.target.value)}
              >
                <option value="">Selecciona curso</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} · {course.name}
                  </option>
                ))}
              </select>
              <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
                Ver alumnos
              </button>
            </form>
            <form onSubmit={handleLookupByStudent} className="flex gap-3">
              <select
                className="flex-1 rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                value={studentLookup}
                onChange={(event) => setStudentLookup(event.target.value)}
              >
                <option value="">Selecciona estudiante</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.email}
                  </option>
                ))}
              </select>
              <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
                Ver cursos
              </button>
            </form>
          </div>
          {lookupResult.length > 0 && (
            <div className="mt-4 rounded-2xl border border-[var(--border)] p-4 text-sm">
              <p className="text-xs uppercase text-[var(--ink-muted)]">Resultados</p>
              <ul className="mt-2 space-y-2">
                {lookupResult.map((enrollment) => (
                  <li key={enrollment.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span>{enrollment.course?.name || enrollment.courseId}</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[var(--ink-muted)]">{enrollment.student?.email || enrollment.studentId}</span>
                      <button
                        className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                        onClick={() => handleDropEnrollment(enrollment.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Matrículas recientes</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[var(--ink-muted)]">
                <tr>
                  <th className="py-3">Estudiante</th>
                  <th className="py-3">Curso</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3">Fecha</th>
                  <th className="py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-[var(--ink-muted)]">
                      Cargando matrículas...
                    </td>
                  </tr>
                ) : enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-[var(--ink-muted)]">
                      No hay matrículas.
                    </td>
                  </tr>
                ) : (
                  enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-t border-[var(--border)]">
                      <td className="py-3">
                        {enrollment.student?.email || enrollment.studentId}
                      </td>
                      <td className="py-3">{enrollment.course?.name || enrollment.courseId}</td>
                      <td className="py-3">{enrollment.status}</td>
                      <td className="py-3">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <button
                          className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                          onClick={() => handleDropEnrollment(enrollment.id)}
                        >
                          Eliminar
                        </button>
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
