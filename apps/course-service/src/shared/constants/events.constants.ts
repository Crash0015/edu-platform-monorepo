export const EVENT_TYPES = {
  COURSE_CREATED: 'academic.course.created',
  COURSE_UPDATED: 'academic.course.updated',
  COURSE_DELETED: 'academic.course.deleted',
  TEACHER_ASSIGNED: 'academic.teacher.assigned',
} as const;

export const EVENT_VERSION = 1;
export const EVENT_PRODUCER = 'course-service';
