'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherDashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/teacher/cursos');
  }, [router]);

  return null;
}
