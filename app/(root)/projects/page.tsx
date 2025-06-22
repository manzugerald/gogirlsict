import { getAllProjects } from "@/lib/actions/projects";
import ProjectsPageClient from "./ProjectsPageClient";

// This is the server component
export default async function ProjectsPage() {
  const projects = await getAllProjects();

  const projectsData = projects.map((project) => ({
    id: project.id,
    title: project.title,
    status: project.projectStatus,
    images: project.images?.length ? project.images : ["/assets/images/projects/p2.png"],
  }));

  return <ProjectsPageClient projects={projects} />;
}