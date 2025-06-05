// Import PrismaClient from '@prisma/client' to use the official generated client
// import { PrismaClient } from '@/lib/generated/prisma';
import { PrismaClient } from '@/lib/generated/prisma';
import { slugify } from '@/lib/utils';

const prisma = new PrismaClient();

async function main() {
  // Seed Projects (with checks to avoid duplicate slugs)
  const projects = [
    {
      title: 'Website Redesign',
      content: 'Redesigning the landing page and portfolio.',
      images: ['/images/projects/p1.jpg'],
      status: 'active',
    },
    {
      title: 'Mobile App Launch',
      content: 'Launching the GoGirls mobile app',
      images: ['/images/projects/p2.png'],
      status: 'completed',
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: slugify(project.title) },
      update: {}, // no updates for simplicity
      create: {
        title: project.title,
        slug: slugify(project.title),
        content: project.content,
        images: project.images,
        status: project.status as any, // or better: define type explicitly in your schema
      },
    });
  }

  // Seed Homepage (only one row expected)
  const homepageExists = await prisma.homePage.findFirst();

  if (!homepageExists) {
    await prisma.homePage.create({
      data: {
        heroVideo: '/videos/hero.mov',
        vision: 'Empowering girls through technology.',
        mission: 'To promote digital literacy among young women.',
        focus: 'Tech education, mentorship, and innovation.',
        coreValues: 'Inclusivity, Innovation, Empowerment, Integrity',
      },
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
