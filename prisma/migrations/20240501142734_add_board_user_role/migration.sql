-- CreateTable
CREATE TABLE "BoardUserRole" (
    "id" SERIAL NOT NULL,
    "boardId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "BoardUserRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardUserRole_boardId_userId_roleId_key" ON "BoardUserRole"("boardId", "userId", "roleId");

-- AddForeignKey
ALTER TABLE "BoardUserRole" ADD CONSTRAINT "BoardUserRole_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardUserRole" ADD CONSTRAINT "BoardUserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardUserRole" ADD CONSTRAINT "BoardUserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
