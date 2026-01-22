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
  student?: { email: string; fullName?: string | null } | null;
};

type StudentOption = {
  id: string;
  email: string;
  fullName?: string | null;
};

type Course = {
  id: string;
  code: string;
  name: string;
};

export default function TeacherStudentsPage() {
  const { profile } = useProfile();
  const [assignData, setAssignData] = useState({ studentId: '', courseId: '' });
  const [newStudent, setNewStudent] = useState({
    email: '',
    fullName: '',
    identificationNumber: '',
    courseId: '',
  });
  const [courseId, setCourseId] = useState('');
  const [courseFilterId, setCourseFilterId] = useState('');
  const [students, setStudents] = useState<Enrollment[]>([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const studentPageSize = 20;

  useEffect(() => {
    const loadOptions = async () => {
      if (!profile?.id) {
        return;
      }
      try {
        const coursesResponse = await apiFetchAuth<Course[]>(`/gateway/courses/teachers/${profile.id}`);
        setCourses(coursesResponse || []);
        const studentsResponse = await apiFetchAuth<{ items: StudentOption[] }>(
          `/gateway/students?search=${encodeURIComponent(studentSearch)}&limit=${studentPageSize}&offset=${
            (studentPage - 1) * studentPageSize
          }`,
        );
        setStudentOptions(studentsResponse.items || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudieron cargar opciones.';
        setError(message);
      }
    };
    loadOptions();
  }, [profile?.id, studentSearch, studentPage]);

  const handleAssign = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');
    try {
      await apiFetchAuth('/gateway/enrollments/assign', {
        method: 'POST',
        body: JSON.stringify(assignData),
      });
      setInfo('Matricula registrada correctamente.');
      setAssignData({ studentId: '', courseId: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo matricular.';
      setError(message);
    }
  };

  const handleAssignWithProfile = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');
    try {
      await apiFetchAuth('/gateway/enrollments/assign-with-profile', {
        method: 'POST',
        body: JSON.stringify({
          email: newStudent.email,
          fullName: newStudent.fullName,
          identificationNumber: newStudent.identificationNumber || undefined,
          courseId: newStudent.courseId,
        }),
      });
      setInfo(`Matricula registrada. Si el estudiante es nuevo, recibira un enlace de acceso en ${newStudent.email}.`);
      setNewStudent({ email: '', fullName: '', identificationNumber: '', courseId: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo matricular.';
      setError(message);
    }
  };

  const handleLoadStudents = async (event?: FormEvent) => {
    event?.preventDefault();
    setError('');
    setInfo('');
    try {
      const targetCourseId = courseFilterId || courseId;
      const response = await apiFetchAuth<Enrollment[]>(`/gateway/enrollments/courses/${targetCourseId}`);
      setStudents(response || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar estudiantes.';
      setError(message);
    }
  };

  const handleDropEnrollment = async (enrollmentId: string) => {
    if (!confirm('¿Eliminar matrícula?')) {
      return;
    }
    setError('');
    setInfo('');
    try {
      await apiFetchAuth(`/gateway/enrollments/${enrollmentId}`, { method: 'DELETE' });
      const targetCourseId = courseFilterId || courseId;
      if (targetCourseId) {
        const response = await apiFetchAuth<Enrollment[]>(`/gateway/enrollments/courses/${targetCourseId}`);
        setStudents(response || []);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar la matrícula.';
      setError(message);
    }
  };

  const handleDeleteStudent = async (studentId: string, email?: string | null) => {
    if (!confirm(`¿Eliminar estudiante ${email || studentId}? Se borrara de todos los cursos.`)) {
      return;
    }
    const confirmation = prompt('Escribe ELIMINAR para confirmar:');
    if (confirmation !== 'ELIMINAR') {
      return;
    }
    setError('');
    setInfo('');
    try {
      await apiFetchAuth(`/gateway/students/${studentId}`, { method: 'DELETE' });
      const targetCourseId = courseFilterId || courseId;
      if (targetCourseId) {
        const response = await apiFetchAuth<Enrollment[]>(`/gateway/enrollments/courses/${targetCourseId}`);
        setStudents(response || []);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el estudiante.';
      setError(message);
    }
  };

  return (
    <DashboardShell title="Docente" requiredRoles={['TEACHER']} navItems={teacherNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Matricular estudiante</h2>
          <div className="mt-4 grid gap-6">
            <form onSubmit={handleAssignWithProfile} className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                placeholder="Correo del estudiante"
                value={newStudent.email}
                onChange={(event) => setNewStudent({ ...newStudent, email: event.target.value })}
                required
              />
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                placeholder="Nombre completo"
                value={newStudent.fullName}
                onChange={(event) => setNewStudent({ ...newStudent, fullName: event.target.value })}
                required
              />
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                placeholder="Cedula (opcional)"
                value={newStudent.identificationNumber}
                onChange={(event) => setNewStudent({ ...newStudent, identificationNumber: event.target.value })}
              />
              <select
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                value={newStudent.courseId}
                onChange={(event) => setNewStudent({ ...newStudent, courseId: event.target.value })}
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
                Matricular con datos
              </button>
            </form>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-xs text-[var(--ink-muted)]">
              Si el estudiante ya existe, selecciona desde el listado.
            </div>
            <form onSubmit={handleAssign} className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm md:col-span-2"
                placeholder="Buscar estudiante por nombre o email"
                value={studentSearch}
                onChange={(event) => {
                  setStudentSearch(event.target.value);
                  setStudentPage(1);
                }}
              />
              <select
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                value={assignData.studentId}
                onChange={(event) => setAssignData({ ...assignData, studentId: event.target.value })}
                required
              >
                <option value="">Selecciona estudiante</option>
                {studentOptions.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName ? `${student.fullName} · ` : ''}{student.email}
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
              <button className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-semibold md:col-span-2">
                Matricular estudiante
              </button>
            </form>
            <div className="flex items-center justify-between text-xs text-[var(--ink-muted)]">
              <button
                className="rounded-full border border-[var(--border)] px-3 py-1 font-semibold"
                onClick={() => setStudentPage((prev) => Math.max(1, prev - 1))}
                disabled={studentPage === 1}
                type="button"
              >
                Anterior
              </button>
              <span>Pagina {studentPage}</span>
              <button
                className="rounded-full border border-[var(--border)] px-3 py-1 font-semibold"
                onClick={() => setStudentPage((prev) => prev + 1)}
                disabled={studentOptions.length < studentPageSize}
                type="button"
              >
                Siguiente
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {info && <p className="mt-3 text-sm text-emerald-700">{info}</p>}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Estudiantes por curso</h2>
            <button
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
              type="button"
              onClick={() => {
                if (!courseFilterId && !courseId) {
                  return;
                }
                void handleLoadStudents();
              }}
            >
              Refrescar
            </button>
          </div>
          <form onSubmit={handleLoadStudents} className="mt-4 flex flex-wrap gap-3">
            <select
              className="flex-1 rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={courseFilterId}
              onChange={(event) => setCourseFilterId(event.target.value)}
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
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        {student.student?.fullName ? `${student.student.fullName} · ` : ''}
                        {student.student?.email || student.studentId} · {student.status}
                      </div>
                      <button
                        className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                        onClick={() => handleDropEnrollment(student.id)}
                      >
                        Eliminar
                      </button>
                      <button
                        className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                        onClick={() => handleDeleteStudent(student.studentId, student.student?.email)}
                      >
                        Eliminar estudiante
                      </button>
                    </div>
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
