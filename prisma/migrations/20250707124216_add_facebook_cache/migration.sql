-- CreateTable
CREATE TABLE "FacebookPost" (
    "id" TEXT NOT NULL,
    "message" TEXT,
    "createdTime" TIMESTAMP(3) NOT NULL,
    "permalinkUrl" TEXT NOT NULL,
    "fullPicture" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacebookPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacebookCacheMeta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lastFetched" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacebookCacheMeta_pkey" PRIMARY KEY ("id")
);
