-- CreateEnum
CREATE TYPE "TutoringSessionStatus" AS ENUM ('OPEN', 'RESERVED', 'CANCELLED', 'DONE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TutoringMode" AS ENUM ('ONLINE', 'IN_PERSON');

-- CreateTable
CREATE TABLE "tutoring_sessions" (
    "id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "availability_slot_id" UUID NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "mode" "TutoringMode" NOT NULL DEFAULT 'ONLINE',
    "location" TEXT,
    "meeting_url" TEXT,
    "status" "TutoringSessionStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "tutoring_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "tutoring_session_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "reserved_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tutoring_sessions_availability_slot_id_key" ON "tutoring_sessions"("availability_slot_id");

-- CreateIndex
CREATE INDEX "idx_tutoring_sessions_teacher_id" ON "tutoring_sessions"("teacher_id");

-- CreateIndex
CREATE INDEX "idx_tutoring_sessions_course_id" ON "tutoring_sessions"("course_id");

-- CreateIndex
CREATE INDEX "idx_tutoring_sessions_status" ON "tutoring_sessions"("status");

-- CreateIndex
CREATE INDEX "idx_tutoring_sessions_start_time" ON "tutoring_sessions"("start_time");

-- CreateIndex
CREATE INDEX "idx_tutoring_sessions_end_time" ON "tutoring_sessions"("end_time");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_tutoring_session_id_key" ON "bookings"("tutoring_session_id");

-- CreateIndex
CREATE INDEX "idx_bookings_student_id" ON "bookings"("student_id");

-- CreateIndex
CREATE INDEX "idx_bookings_status" ON "bookings"("status");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tutoring_session_id_fkey" FOREIGN KEY ("tutoring_session_id") REFERENCES "tutoring_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
