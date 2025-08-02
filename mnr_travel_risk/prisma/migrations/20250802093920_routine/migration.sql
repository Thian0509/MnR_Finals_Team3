-- CreateTable
CREATE TABLE "public"."routine" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startLocation" TEXT NOT NULL,
    "startCoordinates" JSONB NOT NULL,
    "endLocation" TEXT NOT NULL,
    "endCoordinates" JSONB NOT NULL,
    "startTime" TEXT NOT NULL,
    "repeatDays" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."routine" ADD CONSTRAINT "routine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
