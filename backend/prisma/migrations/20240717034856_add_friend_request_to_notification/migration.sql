-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "friendRequestId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "connectionCount" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_friendRequestId_fkey" FOREIGN KEY ("friendRequestId") REFERENCES "FriendRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
