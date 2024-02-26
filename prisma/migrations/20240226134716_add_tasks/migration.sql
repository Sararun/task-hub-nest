-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "images" JSONB,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "deadline" TIMESTAMP(3),
    "owner_id" INTEGER NOT NULL,
    "column_id" INTEGER NOT NULL,
    "timestamps" TIMESTAMP NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;
