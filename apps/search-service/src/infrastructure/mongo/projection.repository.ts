import { Injectable } from '@nestjs/common';
import { EnrollmentProjection, ProjectionRepository } from '../../application/search/ports/projection.repository';
import { MongoService } from './mongo.service';

type EnrollmentDocument = EnrollmentProjection & { _id?: string };

@Injectable()
export class MongoProjectionRepository implements ProjectionRepository {
  constructor(private readonly mongoService: MongoService) {}

  async upsertEnrollment(input: EnrollmentProjection): Promise<void> {
    const collection = this.mongoService.collection<EnrollmentDocument>('enrollment_projections');
    await collection.updateOne(
      { studentId: input.studentId, courseId: input.courseId },
      { $set: input },
      { upsert: true },
    );
  }

  async findEnrollmentsByStudent(studentId: string): Promise<EnrollmentProjection[]> {
    const collection = this.mongoService.collection<EnrollmentDocument>('enrollment_projections');
    const results = await collection.find({ studentId }).toArray();
    return results.map((item) => ({
      studentId: item.studentId,
      courseId: item.courseId,
      status: item.status,
    }));
  }
}
