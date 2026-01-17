export type EnrollmentRecord = {
  id: string;
  studentId: string;
  courseId: string;
  status: 'ACTIVE' | 'DROPPED';
};

export interface EnrollmentRepository {
  createEnrollment(input: { studentId: string; courseId: string }): Promise<EnrollmentRecord>;
}
