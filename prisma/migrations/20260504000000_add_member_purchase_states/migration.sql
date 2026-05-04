-- CreateTable
CREATE TABLE "shopping_item_purchases" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "isPurchased" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopping_item_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shopping_item_purchases_itemId_memberId_key" ON "shopping_item_purchases"("itemId", "memberId");

-- AddForeignKey
ALTER TABLE "shopping_item_purchases" ADD CONSTRAINT "shopping_item_purchases_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "shopping_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_item_purchases" ADD CONSTRAINT "shopping_item_purchases_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill owner-level purchase states from the previous item-level flag.
INSERT INTO "shopping_item_purchases" ("id", "itemId", "memberId", "isPurchased", "createdAt", "updatedAt")
SELECT
    concat('legacy_', "id"),
    "id",
    "memberId",
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "shopping_items"
WHERE "isPurchased" = true
ON CONFLICT ("itemId", "memberId") DO UPDATE SET
    "isPurchased" = EXCLUDED."isPurchased",
    "updatedAt" = CURRENT_TIMESTAMP;
