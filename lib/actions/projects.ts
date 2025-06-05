// Data Fetching script
import { prisma } from "@/db/prisma";

export async function getAllProjects() {
    return await prisma.project.findMany({
      orderBy: {createdAt: 'desc'}  
    });
}