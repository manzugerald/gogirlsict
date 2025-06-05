import { Prisma } from "@/lib/generated/prisma";
import { getAllProjects } from "@/lib/actions/projects";
import { ProjectList } from "@/components/shared/projects/project-list";
import { getAllMessages } from "@/lib/actions/programsDirectorMessage";
import MessageCard from "@/components/shared/home/messageCard";

export const metadata = {
  title: 'Projects'
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  const messageContent = await getAllMessages();
  const message = messageContent ?.[1];
  return (
    <main className="p-6 wrapper">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        
      </div>
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <ProjectList projects={projects} />
      <MessageCard
        name = { message.name }
        title= {message.title}
        message= {message.message}
        imageUrl="/images/team/programsDirector.jpg"
      />
    </main>
  );
}
