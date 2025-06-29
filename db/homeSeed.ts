// Import PrismaClient from '@prisma/client' to use the official generated client
// import { PrismaClient } from '@/lib/generated/prisma';

import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.user.findFirst({
        where: {firstName: 'Eva'},
        select: { id: true }
    })

    if (!admin) throw new Error('Admin user not found')
  await prisma.homePage.create({
    data: {
      heroVideo: '/assets/videos/homePage/heroVideo.mov',
      vision:
        'Our vision is to empower underrepresented communities through innovative technologies, equitable access to opportunities, and inclusive education that fosters growth and transformation.',
      mission:
        'Our mission is to harness the power of technology to build resilient communities, equip the next generation with essential digital skills, and bridge the gap between potential and opportunity.',
      focus:
        'We focus on areas such as digital literacy, youth development, gender equity, and community-based innovation to ensure long-term impact.',
      coreValues:
        'Integrity in every action, innovation in every solution, and inclusion in every space — these are the guiding values that shape our programs and partnerships.',
    },
  });

    await prisma.message.create({
    data: {
      title: 'Welcome Message',
      affiliated: 'Co-Founder | Executive Director',
      name: 'Eva Yayi',
      message: 'Welcome to our vibrant and inclusive community! At the heart of our work is a belief that every individual, regardless of background, deserves the opportunity to thrive in a connected, digital world. We are thrilled to launch our new programs aimed at empowering youth, promoting innovation, and making lasting change in the communities we serve. Let us build a future of equal access and shared success.',
      nameImageUrl: '/assets/images/messages/nameImages/programsDirector.jpg',
      messageStatus: 'published',
      createdById: admin.id,
      updatedById: admin.id,
      approvedById: admin.id,
    },
  });
}

main()
  .then(() => {
    console.log('✅ Seeding complete');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    return prisma.$disconnect();
  });
