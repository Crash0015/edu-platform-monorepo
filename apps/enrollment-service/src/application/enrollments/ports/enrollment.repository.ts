export type EnrollmentRecord = {
  id: string;
  studentId: string;
  courseId: string;
  status: 'ACTIVE' | 'DROPPED';
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export interface EnrollmentRepository {
  createEnrollment(input: { studentId: string; courseId: string }): Promise<EnrollmentRecord>;
  getEnrollmentByStudentCourse(studentId: string, courseId: string): Promise<EnrollmentRecord | null>;
  getAllEnrollments(): Promise<EnrollmentRecord[]>;
  getEnrollmentsByStudent(studentId: string): Promise<EnrollmentRecord[]>;
  getEnrollmentsByCourse(courseId: string): Promise<EnrollmentRecord[]>;
  getEnrollmentById(enrollmentId: string): Promise<EnrollmentRecord | null>;
  dropEnrollment(enrollmentId: string): Promise<EnrollmentRecord | null>;
}
