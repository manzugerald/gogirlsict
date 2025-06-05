import { prisma } from "@/db/prisma";

export const getHomePageContent = async() => {
    const content = await prisma.homePage.findFirst();
    return content;
}