-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BLOCKED');

-- CreateTable
CREATE TABLE "availability_slots" (
    "id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "course_id" UUID,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "timezone" VARCHAR(60) NOT NULL,
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_availability_slots_teacher_id" ON "availability_slots"("teacher_id");

-- CreateIndex
CREATE INDEX "idx_availability_slots_start_time" ON "availability_slots"("start_time");

-- CreateIndex
CREATE INDEX "idx_availability_slots_end_time" ON "availability_slots"("end_time");

-- CreateIndex
CREATE INDEX "idx_availability_slots_status" ON "availability_slots"("status");
