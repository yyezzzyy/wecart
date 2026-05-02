-- CreateTable
CREATE TABLE "shopping_item_wants" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shopping_item_wants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shopping_item_wants_itemId_memberId_key" ON "shopping_item_wants"("itemId", "memberId");

-- AddForeignKey
ALTER TABLE "shopping_item_wants" ADD CONSTRAINT "shopping_item_wants_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "shopping_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_item_wants" ADD CONSTRAINT "shopping_item_wants_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
