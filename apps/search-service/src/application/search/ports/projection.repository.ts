export type EnrollmentProjection = {
  studentId: string;
  courseId: string;
  status: string;
  course?: {
    id?: string;
    code: string;
    name: string;
    description?: string | null;
  };
};

export interface ProjectionRepository {
  upsertEnrollment(input: EnrollmentProjection): Promise<void>;
  findEnrollmentsByStudent(studentId: string): Promise<EnrollmentProjection[]>;
}
