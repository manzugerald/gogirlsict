import { PrismaClient } from '@/lib/generated/prisma'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  await prisma.user.create({
    data: {
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
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

