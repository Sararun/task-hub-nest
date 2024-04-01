-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "recepient_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_recepient_id_fkey" FOREIGN KEY ("recepient_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
