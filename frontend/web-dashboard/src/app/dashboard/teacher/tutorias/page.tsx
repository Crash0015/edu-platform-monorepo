'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { teacherNav } from '../../../../lib/nav';
import { useProfile } from '../../../../hooks/useProfile';

type Session = {
  sessionId: string;
  teacherId: string;
  courseId: string;
  availabilitySlotId: string;
  startTime: string;
  endTime: string;
  mode: string;
  location?: string | null;
  meetingUrl?: string | null;
  bookingId?: string | null;
  studentId?: string | null;
  bookingStatus?: string | null;
  reservedAt?: string | null;
};

type UserProfile = {
  id: string;
  email?: string;
  fullName?: string | null;
};

type CourseSummary = {
  id: string;
  code: string;
  name: string;
};

export default function TeacherTutoringPage() {
  const { profile } = useProfile();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState('');
  const [studentLabels, setStudentLabels] = useState<Record<string, string>>({});
  const [courseLabels, setCourseLabels] = useState<Record<string, string>>({});

  const loadSessions = async () => {
    if (!profile?.id) {
      return;
    }
    setError('');
    try {
      const response = await apiFetchAuth<Session[]>(`/gateway/tutoring/sessions/teacher/${profile.id}`);
      const sessionsData = response || [];
      setSessions(sessionsData);

      const studentIds = Array.from(new Set(sessionsData.map((session) => session.studentId).filter(Boolean))) as string[];
      if (studentIds.length === 0) {
        setStudentLabels({});
      } else {
        const entries = await Promise.all(
          studentIds.map(async (studentId) => {
            try {
              const profileResponse = await apiFetchAuth<UserProfile>(`/gateway/users/${studentId}`);
              const label = profileResponse.fullName || profileResponse.email || studentId;
              return [studentId, label] as const;
            } catch {
              return [studentId, studentId] as const;
            }
          }),
        );
        setStudentLabels(Object.fromEntries(entries));
      }

      const courseIds = Array.from(new Set(sessionsData.map((session) => session.courseId).filter(Boolean))) as string[];
      if (courseIds.length === 0) {
        setCourseLabels({});
        return;
      }

      const courseEntries = await Promise.all(
        courseIds.map(async (courseId) => {
          try {
            const courseResponse = await apiFetchAuth<CourseSummary>(`/gateway/courses/${courseId}`);
            return [courseId, `${courseResponse.code} · ${courseResponse.name}`] as const;
          } catch {
            return [courseId, courseId] as const;
          }
        }),
      );
      setCourseLabels(Object.fromEntries(courseEntries));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar tutorias.';
      setError(message);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [profile?.id]);

  return (
    <DashboardShell title="Docente" requiredRoles={['TEACHER']} navItems={teacherNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Tutorias reservadas</h2>
              <p className="text-sm text-[var(--ink-muted)]">Lista de reservas confirmadas por tus estudiantes.</p>
            </div>
            <button
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
              onClick={loadSessions}
            >
              Actualizar
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4 grid gap-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">No hay reservas registradas.</p>
            ) : (
              sessions.map((session) => (
                <div key={session.sessionId} className="rounded-2xl border border-[var(--border)] px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}</p>
                      <p className="text-xs text-[var(--ink-muted)]">Curso: {courseLabels[session.courseId] || session.courseId} · Modalidad: {session.mode}</p>
                      {session.studentId && (
                        <p className="text-xs text-[var(--ink-muted)]">Estudiante: {studentLabels[session.studentId] || session.studentId}</p>
                      )}
                    </div>
                    {session.bookingStatus && (
                      <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">{session.bookingStatus}</span>
                    )}
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
