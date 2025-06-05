import { NextResponse } from "next/server"
import { prisma } from "@/db/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  const { firstName, lastName, username, email, password } = await req.json()

  if (!firstName || !lastName || !username || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  })

  if (existingUser) {
    return NextResponse.json({ error: "Username or email already exists" }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    },
  })

  return NextResponse.json({ message: "User created", user })
}
