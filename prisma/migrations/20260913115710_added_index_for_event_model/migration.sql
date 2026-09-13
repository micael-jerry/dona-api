-- AlterTable
ALTER TABLE "events" ADD COLUMN     "imageUrl" VARCHAR(500);

-- CreateIndex
CREATE INDEX "events_latitude_longitude_idx" ON "events"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_userId_idx" ON "events"("userId");

-- CreateIndex
CREATE INDEX "events_eventCategoryId_idx" ON "events"("eventCategoryId");
