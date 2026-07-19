-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isOAuthGoogleProvider" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "password" DROP NOT NULL;
