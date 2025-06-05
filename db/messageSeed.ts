import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {

  const messageExists = await prisma.message.findFirst();

  if (!messageExists) {
    await prisma.message.create({
      data:{
        title: 'Programs Director',
        affiliated: 'GoGirls ICT Initiative',
        name: 'Eva Yayi Mawa Upele',
        message: 'At GoGirls, we believe every girl deserves the chance to create, lead, and thrive in technology. We empower young women to develop their skills, embrace innovation, and become future tech leaders. Through mentorship, education, and inclusive community support, we aim to break barriers and build a brighter, more equal future',
      },
    });

    await prisma.message.create({
      data:{
        title: 'Mentorship Director',
        affiliated: 'GoGirls ICT Initiative',
        name: 'Yine Yenki Nyika',
        message: 'At GoGirls, we believe every girl deserves the chance to create, lead, and thrive in technology',
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
