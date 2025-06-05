// Data Fetching script
import { prisma } from "@/db/prisma";

export async function getAllMessages() {
    return await prisma.message.findMany({
      orderBy: {createdAt: 'asc'}  
    });
}