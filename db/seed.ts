// Import PrismaClient from '@prisma/client' to use the official generated client
// import { PrismaClient } from '@/lib/generated/prisma';


import { slugify } from '@/lib/utils';


import { PrismaClient } from '@/lib/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('goGirls123', 10)
  const admin = await prisma.user.create({
    data: {
      firstName: 'Eva',
      lastName: 'Yayi',
      username: 'evayayi',
      password: hashedPassword, // Ideally hashed
      email: 'evayayi@gogirlsict.org',
      role: 'admin',
      image: '/assets/images/users/evayayi.jpg',
    },
  })

  const project = await prisma.project.create({
    data: {
      title: 'Community Outreach',
      slug: slugify('Community Outreach'),
      content: 'Details about community outreach.',
      images: ['/assets/images/project/p1.jpg'],
      projectStatus: 'active',
      publishStatus: 'published',
      createdById: admin.id,
      updatedById: admin.id,
      approvedById: admin.id,
    },
  })

  await prisma.report.create({
    data: {
      title: '2025 Q1 Report',
      slug: slugify('2025 Q1 Report'),
      images: ['/assets/images/report/reportTemplate.png'],
      files: ['/assets/pdfs/report/sample2.pdf'],
      publishStatus: 'published',
      accessCount: 0,
      downloadCount: 0,
      createdById: admin.id,
      updatedById: admin.id,
      approvedById: admin.id,
      projectId: project.id,
    },
  })

  await prisma.homePage.create({
    data: {
      heroVideo: '/assets/videos/homePage/heroVideo.mov',
      vision: 'Empowering communities.',
      mission: 'Technology for all.',
      focus: 'Education and inclusion.',
      coreValues: 'Integrity, Innovation, Inclusion.',
    },
  })

  await prisma.message.create({
    data: {
      title: 'Welcome Message',
      affiliated: 'Founder',
      name: 'Eva Yayi',
      message: 'We are excited to launch our new programs',
      nameImageUrl: '/assets/images/messages/nameImages/programsDirector.jpg',
      messageStatus: 'published',
      createdById: admin.id,
      updatedById: admin.id,
      approvedById: admin.id,
    },
  })
}

main()
  .then(() => {
    console.log('✅ Seeding complete')
    return prisma.$disconnect()
  })
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    return prisma.$disconnect()
  })
