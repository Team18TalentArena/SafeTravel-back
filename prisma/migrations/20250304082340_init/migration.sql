/*
  Warnings:

  - A unique constraint covering the columns `[polygonId]` on the table `zones` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "zones" ADD COLUMN     "polygonId" TEXT;

-- CreateTable
CREATE TABLE "Polygon" (
    "id" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Polygon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zones_polygonId_key" ON "zones"("polygonId");

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_polygonId_fkey" FOREIGN KEY ("polygonId") REFERENCES "Polygon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
