-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NotaryProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "notaryType" TEXT NOT NULL DEFAULT 'PRIVATE',
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
INSERT INTO "new_NotaryProfile" ("address", "approvalStatus", "averageRating", "bio", "city", "createdAt", "hourlyRate", "id", "isApproved", "rejectionReason", "state", "updatedAt", "userId", "zip")
SELECT "address", "approvalStatus", "averageRating", "bio", "city", "createdAt", "hourlyRate", "id", "isApproved", "rejectionReason", "state", "updatedAt", "userId", "zip" FROM "NotaryProfile";
DROP TABLE "NotaryProfile";
ALTER TABLE "new_NotaryProfile" RENAME TO "NotaryProfile";
CREATE UNIQUE INDEX "NotaryProfile_userId_key" ON "NotaryProfile"("userId");

CREATE TABLE "new_NotaryService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notaryProfileId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "customPrice" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotaryService_notaryProfileId_fkey" FOREIGN KEY ("notaryProfileId") REFERENCES "NotaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NotaryService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NotaryService" ("createdAt", "customPrice", "id", "notaryProfileId", "serviceId")
SELECT "createdAt", "customPrice", "id", "notaryProfileId", "serviceId" FROM "NotaryService";
DROP TABLE "NotaryService";
ALTER TABLE "new_NotaryService" RENAME TO "NotaryService";
CREATE UNIQUE INDEX "NotaryService_notaryProfileId_serviceId_key" ON "NotaryService"("notaryProfileId", "serviceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Set defaults for new columns
UPDATE "NotaryService"
SET "status" = 'APPROVED';
