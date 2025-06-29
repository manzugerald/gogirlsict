-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER,
    "likeCount" INTEGER,
    "duration" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YouTubeCacheMeta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lastFetched" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouTubeCacheMeta_pkey" PRIMARY KEY ("id")
);
