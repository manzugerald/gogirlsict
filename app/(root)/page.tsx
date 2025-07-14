// ⛔️ DO NOT add 'use client' here!

import { prisma } from '@/db/prisma';
import HomePageClient from './homePageClient';

export default async function HomePage() {
  const ssrContent = await prisma.homePage.findFirst({ orderBy: { createdAt: 'desc' } });
  const ssrMessages = await prisma.message.findMany({
    where: { messageStatus: 'published' },
    orderBy: { createdAt: 'desc' },
  });

  return <HomePageClient ssrContent={ssrContent} ssrMessages={ssrMessages} />;
}
