-- CreateTable
CREATE TABLE "Column" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "column_number" INTEGER NOT NULL,

    CONSTRAINT "Column_pkey" PRIMARY KEY ("id")
);
