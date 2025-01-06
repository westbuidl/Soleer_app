-- CreateEnum
CREATE TYPE "GigStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Gig" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "GigStatus" NOT NULL DEFAULT 'ACTIVE',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedGig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedGig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Gig_userId_idx" ON "Gig"("userId");

-- CreateIndex
CREATE INDEX "SavedGig_userId_idx" ON "SavedGig"("userId");

-- CreateIndex
CREATE INDEX "SavedGig_gigId_idx" ON "SavedGig"("gigId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedGig_userId_gigId_key" ON "SavedGig"("userId", "gigId");

-- AddForeignKey
ALTER TABLE "Gig" ADD CONSTRAINT "Gig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedGig" ADD CONSTRAINT "SavedGig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedGig" ADD CONSTRAINT "SavedGig_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
