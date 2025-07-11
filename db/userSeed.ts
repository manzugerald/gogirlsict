import { PrismaClient } from '@/lib/generated/prisma'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('123', 10)

  await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Super',
      username: 'admin',
      email: 'test@example.com',
      password: hashedPassword,
      image: "/assets/images/users/evayayi.jpg"
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

