import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnrollmentProjection, ProjectionRepository } from './ports/projection.repository';

export const PROJECTION_REPOSITORY = Symbol('PROJECTION_REPOSITORY');

@Injectable()
export class ProjectionService {
  constructor(
    @Inject(PROJECTION_REPOSITORY)
    private readonly repository: ProjectionRepository,
    private readonly configService: ConfigService,
  ) {}

  async applyEnrollmentCreated(input: EnrollmentProjection) {
    await this.repository.upsertEnrollment(input);
  }

  async getEnrollments(studentId: string) {
    const enrollments = await this.repository.findEnrollmentsByStudent(studentId);
    
    // Hydrate missing course data (Quick Fix Strategy)
    const hydrated = await Promise.all(enrollments.map(async (e) => {
      if (e.course && e.course.name && e.course.name !== 'Curso') {
        return e;
      }
      
      try {
        const courseServiceUrl = this.configService.get<string>('COURSE_SERVICE_URL', 'http://course-service:3004');
        if (typeof fetch !== 'undefined') {
          const res = await fetch(`${courseServiceUrl}/api/v1/courses/${e.courseId}`);
          if (res.ok) {
            const course = (await res.json()) as { code: string; name: string; description: string };
            // Update in memory
            e.course = {
               id: e.courseId,
               code: course.code,
               name: course.name,
               description: course.description
            };
            // Optional: Update in DB asynchronously to fix for next time
            this.repository.upsertEnrollment(e).catch(err => console.error(err));
          }
        }
      } catch (err) {
        console.warn('Failed to hydrate course', e.courseId);
      }
      return e;
    }));

    return hydrated;
  }
}
