/*
  Warnings:

  - The values [PARTIAL,OVERDUE] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `level` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `grade_reports` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paidDate` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `credits` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the `_ParentToStudent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `grades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[schoolId,name]` on the table `school_years` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[platformEmail]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schoolId,email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `schoolId` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `parents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mode` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `school_years` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SyncState" AS ENUM ('LOCAL_ONLY', 'SYNCED', 'CONFLICT');

-- CreateEnum
CREATE TYPE "CycleCode" AS ENUM ('PC', 'SC');

-- CreateEnum
CREATE TYPE "TrackType" AS ENUM ('GENERAL', 'TECHNICAL');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('SEQUENCE', 'TERM', 'YEAR');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ENROLLED', 'TRANSFERRED', 'DROPPED', 'EXPELLED', 'YEAR_END');

-- CreateEnum
CREATE TYPE "EnrollmentType" AS ENUM ('NEW', 'RETURNING', 'REPEATER', 'TRANSFER');

-- CreateEnum
CREATE TYPE "EndYearDecision" AS ENUM ('PASS', 'REPEAT', 'EXPELLED', 'DROPPED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "EvaluationType" AS ENUM ('ASSIGNMENT', 'TEST', 'EXAM');

-- CreateEnum
CREATE TYPE "PVType" AS ENUM ('TERM', 'YEAR');

-- CreateEnum
CREATE TYPE "ExitTicketStatus" AS ENUM ('AUTHORIZED', 'REFUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SanctionType" AS ENUM ('WARNING', 'REPRIMAND', 'TEMP_EXCLUSION', 'DEFINITIVE_EXCLUSION', 'WORK');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('TUITION', 'AEE', 'ENROLLMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'BANK_TRANSFER', 'MTN_MOMO', 'ORANGE_MONEY');

-- CreateEnum
CREATE TYPE "MoMoProvider" AS ENUM ('MTN_MOMO', 'ORANGE_MONEY');

-- CreateEnum
CREATE TYPE "MoMoStatus" AS ENUM ('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('SMS', 'WHATSAPP', 'EMAIL', 'INAPP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'PAID', 'CANCELLED');
ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'SUPERADMIN';
ALTER TYPE "UserRole" ADD VALUE 'PROVISEUR_PRINCIPAL';
ALTER TYPE "UserRole" ADD VALUE 'CENSEUR';
ALTER TYPE "UserRole" ADD VALUE 'SURVEILLANT_GENERAL';
ALTER TYPE "UserRole" ADD VALUE 'ECONOME';

-- DropForeignKey
ALTER TABLE "_ParentToStudent" DROP CONSTRAINT "_ParentToStudent_A_fkey";

-- DropForeignKey
ALTER TABLE "_ParentToStudent" DROP CONSTRAINT "_ParentToStudent_B_fkey";

-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_classId_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_reportId_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_studentId_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_classId_fkey";

-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_classId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_paymentId_fkey";

-- DropIndex
DROP INDEX "school_years_name_key";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "clientGeneratedId" TEXT,
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "rowVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "syncState" "SyncState" NOT NULL DEFAULT 'SYNCED';

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "level",
DROP COLUMN "teacherId",
ADD COLUMN     "homeroomTeacherId" TEXT,
ADD COLUMN     "levelId" TEXT,
ADD COLUMN     "schoolId" TEXT NOT NULL,
ADD COLUMN     "serieId" TEXT,
ADD COLUMN     "specialtyId" TEXT;

-- AlterTable
ALTER TABLE "grade_reports" DROP COLUMN "period",
ADD COLUMN     "periodId" TEXT;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "classId" TEXT;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "schoolId" TEXT;

-- AlterTable
ALTER TABLE "parents" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "description",
DROP COLUMN "dueDate",
DROP COLUMN "paidDate",
DROP COLUMN "type",
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "mode" "PaymentMode" NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "parentUserId" TEXT,
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "school_years" ADD COLUMN     "schoolId" TEXT NOT NULL,
ALTER COLUMN "isActive" SET DEFAULT false;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "classId",
ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "classId",
DROP COLUMN "credits",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "timetable" ADD COLUMN     "subjectId" TEXT,
ADD COLUMN     "teacherId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isPlatformUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platformEmail" TEXT,
ADD COLUMN     "schoolId" TEXT;

-- DropTable
DROP TABLE "_ParentToStudent";

-- DropTable
DROP TABLE "grades";

-- DropTable
DROP TABLE "transactions";

-- DropEnum
DROP TYPE "PaymentType";

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ville" TEXT,
    "region" TEXT,
    "slogan" TEXT,
    "logo" TEXT,
    "codePostal" TEXT,
    "timezone" TEXT DEFAULT 'Africa/Douala',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "canManageSchool" BOOLEAN NOT NULL DEFAULT true,
    "canViewAcademics" BOOLEAN NOT NULL DEFAULT true,
    "canViewStudents" BOOLEAN NOT NULL DEFAULT false,
    "canViewPersonnel" BOOLEAN NOT NULL DEFAULT false,
    "canViewFinance" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycles" (
    "id" TEXT NOT NULL,
    "code" "CycleCode" NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "cycleId" TEXT,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT,
    "type" "TrackType" NOT NULL,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periods" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "schoolYearId" TEXT NOT NULL,
    "type" "PeriodType" NOT NULL,
    "number" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_templates" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "nameTemplate" TEXT NOT NULL,
    "capacity" INTEGER,
    "levelId" TEXT,
    "serieId" TEXT,
    "specialtyId" TEXT,

    CONSTRAINT "class_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_subjects" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "weeklyHours" INTEGER NOT NULL DEFAULT 0,
    "bulletinOrder" INTEGER NOT NULL DEFAULT 1,
    "groupName" TEXT,

    CONSTRAINT "class_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_assignments" (
    "id" TEXT NOT NULL,
    "schoolYearId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parents_students" (
    "parentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "relation" TEXT,

    CONSTRAINT "parents_students_pkey" PRIMARY KEY ("parentId","studentId")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolYearId" TEXT NOT NULL,
    "classId" TEXT,
    "status" "EnrollmentStatus" NOT NULL,
    "type" "EnrollmentType",
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDecision" "EndYearDecision",
    "syncState" "SyncState" NOT NULL DEFAULT 'SYNCED',
    "rowVersion" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "clientId" TEXT,
    "clientGeneratedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "end_year_decisions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolYearId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "decision" "EndYearDecision" NOT NULL,
    "nextLevelId" TEXT,
    "nextSerieId" TEXT,
    "nextSpecialtyId" TEXT,
    "note" TEXT,
    "validatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "end_year_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_params" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "schoolYearId" TEXT NOT NULL,
    "levelId" TEXT,
    "subjectId" TEXT,
    "continuousWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.40,
    "examWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.60,
    "precision" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_params_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "schoolYearId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "type" "EvaluationType" NOT NULL,
    "term" INTEGER,
    "sequence" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "outOf" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "description" TEXT,
    "syncState" "SyncState" NOT NULL DEFAULT 'SYNCED',
    "rowVersion" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "clientId" TEXT,
    "clientGeneratedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_entries" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "status" "GradeStatus" NOT NULL DEFAULT 'PENDING',
    "isAbsent" BOOLEAN NOT NULL DEFAULT false,
    "isExcused" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "syncState" "SyncState" NOT NULL DEFAULT 'SYNCED',
    "rowVersion" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "clientId" TEXT,
    "clientGeneratedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulletins" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT,
    "schoolYearId" TEXT NOT NULL,
    "periodId" TEXT,
    "averageGeneral" DOUBLE PRECISION,
    "rank" INTEGER,
    "decision" TEXT,
    "appreciations" JSONB,
    "calcSnapshot" JSONB,
    "pdfUrl" TEXT,
    "validatedByUserId" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bulletins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulletin_lines" (
    "id" TEXT NOT NULL,
    "bulletinId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "average" DOUBLE PRECISION,
    "coefficient" DOUBLE PRECISION,
    "weighted" DOUBLE PRECISION,
    "subjectRank" INTEGER,
    "appreciation" TEXT,

    CONSTRAINT "bulletin_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pv_reports" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "schoolYearId" TEXT NOT NULL,
    "type" "PVType" NOT NULL,
    "term" INTEGER,
    "content" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "validatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pv_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competences" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "competences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicators" (
    "id" TEXT NOT NULL,
    "competenceId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_competences" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "outOf" DOUBLE PRECISION NOT NULL DEFAULT 20.0,

    CONSTRAINT "evaluation_competences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competence_grades" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "appreciation" TEXT,

    CONSTRAINT "competence_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progression_sheets" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "schoolYearId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "term" INTEGER,
    "content" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progression_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exit_tickets" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "authorizedByUserId" TEXT,
    "status" "ExitTicketStatus" NOT NULL DEFAULT 'AUTHORIZED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exit_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discipline_incidents" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "description" TEXT NOT NULL,
    "reportedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discipline_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sanctions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "type" "SanctionType" NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "decidedByUserId" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sanctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discipline_councils" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "schoolYearId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "subject" TEXT,
    "pvUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discipline_councils_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discipline_council_cases" (
    "councilId" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,

    CONSTRAINT "discipline_council_cases_pkey" PRIMARY KEY ("councilId","incidentId")
);

-- CreateTable
CREATE TABLE "fees" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "schoolYearId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "FeeType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "levelId" TEXT,
    "classId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "schoolYearId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'UNPAID',
    "syncState" "SyncState" NOT NULL DEFAULT 'SYNCED',
    "rowVersion" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_lines" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "feeId" TEXT,
    "label" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3),

    CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "momo_transactions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "studentId" TEXT,
    "paymentId" TEXT,
    "provider" "MoMoProvider" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "status" "MoMoStatus" NOT NULL,
    "externalRef" TEXT,
    "internalRef" TEXT NOT NULL,
    "callbackPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "momo_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "hash" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "code" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "recipientUserId" TEXT,
    "channel" "Channel" NOT NULL,
    "templateId" TEXT,
    "payload" JSONB,
    "renderedContent" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "providerResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schools_code_key" ON "schools"("code");

-- CreateIndex
CREATE UNIQUE INDEX "schools_phone_key" ON "schools"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "schools_email_key" ON "schools"("email");

-- CreateIndex
CREATE UNIQUE INDEX "schools_name_key" ON "schools"("name");

-- CreateIndex
CREATE UNIQUE INDEX "school_access_userId_schoolId_key" ON "school_access"("userId", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "cycles_code_key" ON "cycles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "levels_code_key" ON "levels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "series_code_type_key" ON "series"("code", "type");

-- CreateIndex
CREATE UNIQUE INDEX "specialties_code_key" ON "specialties"("code");

-- CreateIndex
CREATE UNIQUE INDEX "periods_schoolId_schoolYearId_type_number_key" ON "periods"("schoolId", "schoolYearId", "type", "number");

-- CreateIndex
CREATE UNIQUE INDEX "class_templates_schoolId_nameTemplate_key" ON "class_templates"("schoolId", "nameTemplate");

-- CreateIndex
CREATE UNIQUE INDEX "class_subjects_classId_subjectId_key" ON "class_subjects"("classId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_assignments_schoolYearId_classId_subjectId_key" ON "teacher_assignments"("schoolYearId", "classId", "subjectId");

-- CreateIndex
CREATE INDEX "enrollments_schoolYearId_classId_idx" ON "enrollments"("schoolYearId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_studentId_schoolYearId_key" ON "enrollments"("studentId", "schoolYearId");

-- CreateIndex
CREATE UNIQUE INDEX "end_year_decisions_studentId_schoolYearId_key" ON "end_year_decisions"("studentId", "schoolYearId");

-- CreateIndex
CREATE INDEX "evaluations_schoolYearId_classId_subjectId_term_sequence_ty_idx" ON "evaluations"("schoolYearId", "classId", "subjectId", "term", "sequence", "type");

-- CreateIndex
CREATE UNIQUE INDEX "grade_entries_evaluationId_studentId_key" ON "grade_entries"("evaluationId", "studentId");

-- CreateIndex
CREATE INDEX "bulletins_studentId_periodId_idx" ON "bulletins"("studentId", "periodId");

-- CreateIndex
CREATE UNIQUE INDEX "bulletin_lines_bulletinId_subjectId_key" ON "bulletin_lines"("bulletinId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "pv_reports_classId_schoolYearId_type_term_key" ON "pv_reports"("classId", "schoolYearId", "type", "term");

-- CreateIndex
CREATE UNIQUE INDEX "competences_subjectId_levelId_code_key" ON "competences"("subjectId", "levelId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "indicators_competenceId_code_key" ON "indicators"("competenceId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_competences_evaluationId_indicatorId_key" ON "evaluation_competences"("evaluationId", "indicatorId");

-- CreateIndex
CREATE UNIQUE INDEX "competence_grades_evaluationId_studentId_indicatorId_key" ON "competence_grades"("evaluationId", "studentId", "indicatorId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_studentId_schoolYearId_key" ON "invoices"("studentId", "schoolYearId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_lines_invoiceId_label_key" ON "invoice_lines"("invoiceId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "momo_transactions_internalRef_key" ON "momo_transactions"("internalRef");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_paymentId_key" ON "receipts"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_number_key" ON "receipts"("number");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_schoolId_code_channel_key" ON "notification_templates"("schoolId", "code", "channel");

-- CreateIndex
CREATE INDEX "notifications_schoolId_status_idx" ON "notifications"("schoolId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "school_years_schoolId_name_key" ON "school_years"("schoolId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "users_platformEmail_key" ON "users"("platformEmail");

-- CreateIndex
CREATE UNIQUE INDEX "users_schoolId_email_key" ON "users"("schoolId", "email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_access" ADD CONSTRAINT "school_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_access" ADD CONSTRAINT "school_access_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levels" ADD CONSTRAINT "levels_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_years" ADD CONSTRAINT "school_years_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periods" ADD CONSTRAINT "periods_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periods" ADD CONSTRAINT "periods_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_templates" ADD CONSTRAINT "class_templates_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_templates" ADD CONSTRAINT "class_templates_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_templates" ADD CONSTRAINT "class_templates_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_templates" ADD CONSTRAINT "class_templates_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_homeroomTeacherId_fkey" FOREIGN KEY ("homeroomTeacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents_students" ADD CONSTRAINT "parents_students_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents_students" ADD CONSTRAINT "parents_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "end_year_decisions" ADD CONSTRAINT "end_year_decisions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "end_year_decisions" ADD CONSTRAINT "end_year_decisions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "end_year_decisions" ADD CONSTRAINT "end_year_decisions_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "end_year_decisions" ADD CONSTRAINT "end_year_decisions_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "end_year_decisions" ADD CONSTRAINT "end_year_decisions_nextLevelId_fkey" FOREIGN KEY ("nextLevelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "end_year_decisions" ADD CONSTRAINT "end_year_decisions_nextSerieId_fkey" FOREIGN KEY ("nextSerieId") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "end_year_decisions" ADD CONSTRAINT "end_year_decisions_nextSpecialtyId_fkey" FOREIGN KEY ("nextSpecialtyId") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "end_year_decisions" ADD CONSTRAINT "end_year_decisions_validatedByUserId_fkey" FOREIGN KEY ("validatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_params" ADD CONSTRAINT "evaluation_params_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_params" ADD CONSTRAINT "evaluation_params_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_params" ADD CONSTRAINT "evaluation_params_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_params" ADD CONSTRAINT "evaluation_params_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_entries" ADD CONSTRAINT "grade_entries_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_entries" ADD CONSTRAINT "grade_entries_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_reports" ADD CONSTRAINT "grade_reports_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletins" ADD CONSTRAINT "bulletins_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletins" ADD CONSTRAINT "bulletins_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletins" ADD CONSTRAINT "bulletins_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletins" ADD CONSTRAINT "bulletins_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletins" ADD CONSTRAINT "bulletins_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletins" ADD CONSTRAINT "bulletins_validatedByUserId_fkey" FOREIGN KEY ("validatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletin_lines" ADD CONSTRAINT "bulletin_lines_bulletinId_fkey" FOREIGN KEY ("bulletinId") REFERENCES "bulletins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulletin_lines" ADD CONSTRAINT "bulletin_lines_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pv_reports" ADD CONSTRAINT "pv_reports_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pv_reports" ADD CONSTRAINT "pv_reports_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pv_reports" ADD CONSTRAINT "pv_reports_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pv_reports" ADD CONSTRAINT "pv_reports_validatedByUserId_fkey" FOREIGN KEY ("validatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable" ADD CONSTRAINT "timetable_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable" ADD CONSTRAINT "timetable_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competences" ADD CONSTRAINT "competences_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competences" ADD CONSTRAINT "competences_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_competenceId_fkey" FOREIGN KEY ("competenceId") REFERENCES "competences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_competences" ADD CONSTRAINT "evaluation_competences_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_competences" ADD CONSTRAINT "evaluation_competences_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "indicators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence_grades" ADD CONSTRAINT "competence_grades_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence_grades" ADD CONSTRAINT "competence_grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence_grades" ADD CONSTRAINT "competence_grades_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "indicators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression_sheets" ADD CONSTRAINT "progression_sheets_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression_sheets" ADD CONSTRAINT "progression_sheets_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression_sheets" ADD CONSTRAINT "progression_sheets_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression_sheets" ADD CONSTRAINT "progression_sheets_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression_sheets" ADD CONSTRAINT "progression_sheets_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit_tickets" ADD CONSTRAINT "exit_tickets_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit_tickets" ADD CONSTRAINT "exit_tickets_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit_tickets" ADD CONSTRAINT "exit_tickets_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit_tickets" ADD CONSTRAINT "exit_tickets_authorizedByUserId_fkey" FOREIGN KEY ("authorizedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_incidents" ADD CONSTRAINT "discipline_incidents_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_incidents" ADD CONSTRAINT "discipline_incidents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_incidents" ADD CONSTRAINT "discipline_incidents_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_incidents" ADD CONSTRAINT "discipline_incidents_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanctions" ADD CONSTRAINT "sanctions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanctions" ADD CONSTRAINT "sanctions_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "discipline_incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanctions" ADD CONSTRAINT "sanctions_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_councils" ADD CONSTRAINT "discipline_councils_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_councils" ADD CONSTRAINT "discipline_councils_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_council_cases" ADD CONSTRAINT "discipline_council_cases_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "discipline_councils"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_council_cases" ADD CONSTRAINT "discipline_council_cases_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "discipline_incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees" ADD CONSTRAINT "fees_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees" ADD CONSTRAINT "fees_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees" ADD CONSTRAINT "fees_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees" ADD CONSTRAINT "fees_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES "fees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "momo_transactions" ADD CONSTRAINT "momo_transactions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "momo_transactions" ADD CONSTRAINT "momo_transactions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "momo_transactions" ADD CONSTRAINT "momo_transactions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "momo_transactions" ADD CONSTRAINT "momo_transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "notification_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
