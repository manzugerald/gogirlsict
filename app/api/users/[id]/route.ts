import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import bcrypt from 'bcrypt';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { redis } from '@/utils/redis';

const USERS_CACHE_KEY = 'users:all';
const SINGLE_USER_CACHE_PREFIX = 'users:'; // users:[id]
const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// PATCH: Update user image, username check, password, email, names (but not all required)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const userId = params.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const formData = await req.formData();
  const username = formData.get('username') as string | null;
  const password = formData.get('password') as string | null;
  const email = formData.get('email') as string | null;
  const firstName = formData.get('firstName') as string | null;
  const lastName = formData.get('lastName') as string | null;
  const imageFile = formData.get('image') as File | null;
  const oldImageUrl = formData.get('oldImageUrl') as string | null;

  if (username) {
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || dbUser.username !== username) {
      return NextResponse.json({ error: 'The Username is incorrect.' }, { status: 400 });
    }
  }

  let updateData: any = {};

  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (email) updateData.email = email;
  if (username) updateData.username = username;

  // Handle image upload
  if (imageFile && imageFile.size > 0) {
    // Delete old image if provided
    if (oldImageUrl) {
      try {
        const filePath = path.join(process.cwd(), 'public', oldImageUrl);
        await fs.unlink(filePath);
      } catch {}
    }
    const ext = imageFile.name.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public/assets/images/users');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    updateData.image = `/assets/images/users/${filename}`;
  }

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, username: true, email: true, image: true, firstName: true, lastName: true },
  });

  // Invalidate both single and all-users cache
  await Promise.all([redis.del(SINGLE_USER_CACHE_PREFIX + userId), redis.del(USERS_CACHE_KEY)]);

  return NextResponse.json({ message: 'User updated', user: updatedUser });
}

// DELETE: Delete user with given id and remove user's image from disk if present
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const userId = params.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Delete the image file (if present and not default)
  if (user.image) {
    try {
      // user.image is like "/assets/images/users/filename.jpg"
      const filePath = path.join(process.cwd(), 'public', user.image);
      await fs.unlink(filePath);
    } catch (e) {
      // It's ok if the file doesn't exist, continue
    }
  }

  // Delete user from database
  await prisma.user.delete({ where: { id: userId } });

  // Invalidate both single and all-users cache
  await Promise.all([redis.del(SINGLE_USER_CACHE_PREFIX + userId), redis.del(USERS_CACHE_KEY)]);

  return NextResponse.json({ message: 'User deleted' });
}
