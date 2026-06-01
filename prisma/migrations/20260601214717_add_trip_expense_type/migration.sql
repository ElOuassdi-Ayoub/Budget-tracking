-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TripExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'expense',
    "date" DATETIME NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TripExpense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TripExpense" ("amount", "createdAt", "date", "id", "label", "note", "tripId") SELECT "amount", "createdAt", "date", "id", "label", "note", "tripId" FROM "TripExpense";
DROP TABLE "TripExpense";
ALTER TABLE "new_TripExpense" RENAME TO "TripExpense";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
