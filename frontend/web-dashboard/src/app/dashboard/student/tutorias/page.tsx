'use client';

import { FormEvent, useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { studentNav } from '../../../../lib/nav';
import { useProfile } from '../../../../hooks/useProfile';

type AvailableSession = {
  id: string;
  teacherId: string;
  courseId: string | null;
  startTime: string;
  endTime: string;
};

type Enrollment = {
  id?: string;
  courseId: string;
  status: string;
  course: { id?: string; code: string; name: string } | null;
};

type TeacherCourse = {
  id: string;
  teacherId: string;
  courseId: string;
  roleInCourse: string;
};

type UserProfile = {
  id: string;
  email?: string;
};

type TeacherOption = {
  id: string;
  label: string;
};

export default function StudentTutoringPage() {
  const { profile } = useProfile();
  const [teacherId, setTeacherId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [sessions, setSessions] = useState<AvailableSession[]>([]);
  const [reserveData, setReserveData] = useState({
    availabilitySlotId: '',
    mode: 'ONLINE',
    location: '',
    meetingUrl: '',
  });
  const [cancelBookingId, setCancelBookingId] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const sessionLabel = (session: AvailableSession) => {
    const start = new Date(session.startTime).toLocaleString();
    const end = new Date(session.endTime).toLocaleString();
    const courseLabel = session.courseId ? `Curso ${session.courseId}` : 'General';
    return `${start} - ${end} · ${courseLabel}`;
  };

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

  useEffect(() => {
    const loadTeachers = async () => {
      if (!courseId) {
        setTeachers([]);
        return;
      }
      setLoadingTeachers(true);
      try {
        const response = await apiFetchAuth<TeacherCourse[]>(`/gateway/courses/${courseId}/teachers`);
        const teacherProfiles = await Promise.all(
          (response || []).map(async (teacher) => {
            try {
              const profileResponse = await apiFetchAuth<UserProfile>(`/gateway/users/${teacher.teacherId}`);
              return { id: teacher.teacherId, label: profileResponse.email || teacher.teacherId };
            } catch {
              return { id: teacher.teacherId, label: teacher.teacherId };
            }
          }),
        );
        setTeachers(teacherProfiles);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudieron cargar docentes.';
        setError(message);
      } finally {
        setLoadingTeachers(false);
      }
    };
    loadTeachers();
  }, [courseId]);

  const handleFetch = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!teacherId) {
      setError('Selecciona un docente para buscar tutorías.');
      return;
    }
    const params = new URLSearchParams();
    params.set('teacherId', teacherId);
    const response = await apiFetchAuth<AvailableSession[]>(`/gateway/tutoring/sessions/available?${params.toString()}`);
    setSessions(response || []);
  };

  const handleReserve = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setStatus('');
    try {
      await apiFetchAuth('/gateway/tutoring/sessions/reserve', {
        method: 'POST',
        body: JSON.stringify({
          availabilitySlotId: reserveData.availabilitySlotId,
          teacherId,
          studentId: profile?.id,
          courseId: courseId || undefined,
          mode: reserveData.mode,
          location: reserveData.location || undefined,
          meetingUrl: reserveData.meetingUrl || undefined,
        }),
      });
      setStatus('Tutoría reservada correctamente.');
      setReserveData({ availabilitySlotId: '', mode: 'ONLINE', location: '', meetingUrl: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo reservar.';
      setError(message);
    }
  };

  const handleCancel = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setStatus('');
    try {
      await apiFetchAuth('/gateway/tutoring/sessions/cancel', {
        method: 'POST',
        body: JSON.stringify({ bookingId: cancelBookingId }),
      });
      setStatus('Reserva cancelada.');
      setCancelBookingId('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cancelar.';
      setError(message);
    }
  };

  return (
    <DashboardShell title="Estudiante" requiredRoles={['STUDENT']} navItems={studentNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Buscar tutorías disponibles</h2>
          <form onSubmit={handleFetch} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={courseId}
              onChange={(event) => {
                const val = event.target.value;
                setCourseId(val);
                setTeacherId('');
                setSessions([]);
              }}
            >
              <option value="">Selecciona curso</option>
              {loadingCourses ? (
                <option value="" disabled>
                  Cargando cursos...
                </option>
              ) : (
                 courses
                   .filter((enrollment) => enrollment.courseId)
                   .map((enrollment) => (
                     <option key={enrollment.courseId} value={enrollment.courseId}>
                       {enrollment.course?.code || 'S/C'} · {enrollment.course?.name || 'Sin Nombre'}
                     </option>
                   ))
              )}
            </select>
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={teacherId}
              onChange={(event) => setTeacherId(event.target.value)}
              required
              disabled={!courseId || loadingTeachers}
            >
              <option value="">{loadingTeachers ? 'Cargando docentes...' : 'Selecciona docente'}</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.label}
                </option>
              ))}
            </select>
            <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
              Buscar
            </button>
          </form>
          <div className="mt-4 grid gap-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">No hay tutorías disponibles.</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-[var(--border)] px-4 py-3">
                  <p className="text-sm font-semibold">{new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}</p>
                  <p className="text-xs text-[var(--ink-muted)]">Slot: {session.id} · Curso: {session.courseId || 'General'}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Reservar tutoría</h2>
          <form onSubmit={handleReserve} className="mt-4 grid gap-4 md:grid-cols-2">
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={reserveData.availabilitySlotId}
              onChange={(event) => setReserveData({ ...reserveData, availabilitySlotId: event.target.value })}
              required
              disabled={sessions.length === 0}
            >
              <option value="">
                {sessions.length === 0 ? 'Primero busca tutorias disponibles' : 'Selecciona un horario'}
              </option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {sessionLabel(session)}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={courseId}
              onChange={(event) => {
                setCourseId(event.target.value);
                setTeacherId('');
                setSessions([]);
              }}
              required
            >
              <option value="">Selecciona curso</option>
              {loadingCourses ? (
                <option value="" disabled>
                  Cargando cursos...
                </option>
              ) : (
                 courses
                   .filter((enrollment) => enrollment.courseId)
                   .map((enrollment) => (
                     <option key={enrollment.courseId} value={enrollment.courseId}>
                       {enrollment.course?.code || 'S/C'} · {enrollment.course?.name || 'Sin Nombre'}
                     </option>
                   ))
              )}
            </select>
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={teacherId}
              onChange={(event) => setTeacherId(event.target.value)}
              required
              disabled={!courseId || loadingTeachers}
            >
              <option value="">{loadingTeachers ? 'Cargando docentes...' : 'Selecciona docente'}</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={reserveData.mode}
              onChange={(event) => setReserveData({ ...reserveData, mode: event.target.value })}
            >
              <option value="ONLINE">Online</option>
              <option value="IN_PERSON">Presencial</option>
            </select>
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              placeholder="Ubicación (opcional)"
              value={reserveData.location}
              onChange={(event) => setReserveData({ ...reserveData, location: event.target.value })}
            />
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              placeholder="Meeting URL (opcional)"
              value={reserveData.meetingUrl}
              onChange={(event) => setReserveData({ ...reserveData, meetingUrl: event.target.value })}
            />
            <button className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white md:col-span-2">
              Reservar
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Cancelar reserva</h2>
          <form onSubmit={handleCancel} className="mt-4 flex flex-wrap gap-3">
            <input
              className="flex-1 rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              placeholder="Booking ID"
              value={cancelBookingId}
              onChange={(event) => setCancelBookingId(event.target.value)}
              required
            />
            <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
              Cancelar
            </button>
          </form>
          {status && <p className="mt-3 text-sm text-emerald-600">{status}</p>}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
      </div>
    </DashboardShell>
  );
}
