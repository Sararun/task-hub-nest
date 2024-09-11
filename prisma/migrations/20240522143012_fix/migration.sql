/*
  Warnings:

  - Changed the type of `name` on the `Role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `Status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StatusEnum" AS ENUM ('NotStatus', 'TODO', 'InProgress', 'Review', 'Done', 'Blocked');

-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('Admin', 'Member');

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "name",
ADD COLUMN     "name" "RoleEnum" NOT NULL;

-- AlterTable
ALTER TABLE "Status" DROP COLUMN "name",
ADD COLUMN     "name" "StatusEnum" NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "photos" JSONB,
ADD COLUMN     "recepient_id" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "photo" TEXT;

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "answerId" INTEGER,
    "type" BOOLEAN,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_recepient_id_fkey" FOREIGN KEY ("recepient_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
