-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "appointmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "notaryId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "scheduledTime" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalCost" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_notaryId_fkey" FOREIGN KEY ("notaryId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("createdAt", "customerId", "duration", "id", "notaryId", "notes", "scheduledTime", "serviceId", "status", "totalCost", "updatedAt")
SELECT "createdAt", "customerId", "duration", "id", "notaryId", "notes", "scheduledTime", "serviceId", "status", "totalCost", "updatedAt" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";

CREATE TABLE "new_NotaryCertification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notaryProfileId" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "dateObtained" DATETIME,
    "documentUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotaryCertification_notaryProfileId_fkey" FOREIGN KEY ("notaryProfileId") REFERENCES "NotaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NotaryCertification_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NotaryCertification" ("certificationId", "createdAt", "dateObtained", "documentUrl", "id", "notaryProfileId")
SELECT "certificationId", "createdAt", "dateObtained", "documentUrl", "id", "notaryProfileId" FROM "NotaryCertification";
DROP TABLE "NotaryCertification";
ALTER TABLE "new_NotaryCertification" RENAME TO "NotaryCertification";
CREATE UNIQUE INDEX "NotaryCertification_notaryProfileId_certificationId_key" ON "NotaryCertification"("notaryProfileId", "certificationId");

CREATE TABLE "new_NotaryProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "hourlyRate" REAL NOT NULL,
    "averageRating" REAL NOT NULL DEFAULT 0,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotaryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NotaryProfile" ("address", "averageRating", "bio", "city", "createdAt", "hourlyRate", "id", "isApproved", "state", "updatedAt", "userId", "zip")
SELECT "address", "averageRating", "bio", "city", "createdAt", "hourlyRate", "id", "isApproved", "state", "updatedAt", "userId", "zip" FROM "NotaryProfile";
DROP TABLE "NotaryProfile";
ALTER TABLE "new_NotaryProfile" RENAME TO "NotaryProfile";
CREATE UNIQUE INDEX "NotaryProfile_userId_key" ON "NotaryProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Normalize appointment statuses to match enum casing
UPDATE "Appointment"
SET "status" = CASE
  WHEN lower("status") = 'pending' THEN 'PENDING'
  WHEN lower("status") = 'confirmed' THEN 'CONFIRMED'
  WHEN lower("status") = 'completed' THEN 'COMPLETED'
  WHEN lower("status") = 'cancelled' THEN 'CANCELLED'
  ELSE upper("status")
END;

-- Initialize approval status for existing notaries
UPDATE "NotaryProfile"
SET "approvalStatus" = CASE WHEN "isApproved" = 1 THEN 'APPROVED' ELSE 'PENDING' END,
    "rejectionReason" = CASE WHEN "isApproved" = 1 THEN NULL ELSE "rejectionReason" END;
