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
    },
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
