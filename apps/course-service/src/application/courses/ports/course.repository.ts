export type CourseStatus = 'ACTIVE' | 'INACTIVE' | 'OPEN' | 'CLOSED';
export type TeacherRoleInCourse = 'OWNER' | 'ASSISTANT';

export interface CourseRecord {
  id: string;
  code: string;
  name: string;
  description: string | null;
  periodId: string | null;
  status: CourseStatus;
  capacity: number;
  seatsTaken: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface TeacherCourseRecord {
  id: string;
  teacherId: string;
  courseId: string;
  roleInCourse: TeacherRoleInCourse;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseRepository {
  createCourse(input: {
    code: string;
    name: string;
    description?: string;
    periodId?: string;
    capacity?: number;
    createdBy?: string;
  }): Promise<CourseRecord>;

  getCourseById(courseId: string): Promise<CourseRecord | null>;
  getCourseByCode(code: string): Promise<CourseRecord | null>;
  listCourses(filters?: { status?: CourseStatus; periodId?: string }): Promise<CourseRecord[]>;
  getCoursesByTeacher(teacherId: string): Promise<CourseRecord[]>;

  updateCourse(courseId: string, input: {
    name?: string;
    description?: string;
    status?: CourseStatus;
    capacity?: number;
    updatedBy?: string;
  }): Promise<CourseRecord | null>;

  deleteCourse(courseId: string): Promise<boolean>;

  assignTeacher(input: {
    teacherId: string;
    courseId: string;
    roleInCourse?: TeacherRoleInCourse;
    createdBy?: string;
  }): Promise<TeacherCourseRecord>;

  getTeachersByCourse(courseId: string): Promise<TeacherCourseRecord[]>;
  removeTeacherFromCourse(teacherId: string, courseId: string): Promise<boolean>;

  incrementSeatsTaken(courseId: string): Promise<void>;
  decrementSeatsTaken(courseId: string): Promise<void>;
}
