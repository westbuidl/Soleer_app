-- CreateTable
CREATE TABLE "Hire" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Hire_gigId_idx" ON "Hire"("gigId");

-- CreateIndex
CREATE INDEX "Hire_clientId_idx" ON "Hire"("clientId");

-- CreateIndex
CREATE INDEX "Hire_freelancerId_idx" ON "Hire"("freelancerId");

-- AddForeignKey
ALTER TABLE "Hire" ADD CONSTRAINT "Hire_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hire" ADD CONSTRAINT "Hire_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hire" ADD CONSTRAINT "Hire_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
