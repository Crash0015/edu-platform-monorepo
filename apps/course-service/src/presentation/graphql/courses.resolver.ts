import { Args, Query, Resolver } from '@nestjs/graphql';
import { CourseService } from '../../application/courses/course.service';
import { CourseGraphQLType } from './course.graphql';

@Resolver(() => CourseGraphQLType)
export class CoursesResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query(() => [CourseGraphQLType], { name: 'courses' })
  async getCourses(): Promise<CourseGraphQLType[]> {
    return this.courseService.listCourses({}) as unknown as CourseGraphQLType[];
  }

  @Query(() => CourseGraphQLType, { name: 'course', nullable: true })
  async getCourse(@Args('id') id: string): Promise<CourseGraphQLType | null> {
    return this.courseService.getCourseById(id) as unknown as CourseGraphQLType;
  }
}
