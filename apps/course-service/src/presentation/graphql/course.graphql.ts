import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Course')
export class CourseGraphQLType {
  @Field()
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field({ nullable: true })
  periodId?: string | null;

  @Field()
  status!: string;

  @Field(() => Int)
  capacity!: number;

  @Field(() => Int)
  seatsTaken!: number;
}
