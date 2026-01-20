'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentDashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/student/cursos');
  }, [router]);

  return null;
}
