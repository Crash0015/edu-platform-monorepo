export type EnrollmentProjection = {
  studentId: string;
  courseId: string;
  status: string;
};

export interface ProjectionRepository {
  upsertEnrollment(input: EnrollmentProjection): Promise<void>;
  findEnrollmentsByStudent(studentId: string): Promise<EnrollmentProjection[]>;
}
