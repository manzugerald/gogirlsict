import { getAllProjects } from "@/lib/actions/projects";
import ProjectsPageClient from "./ProjectsPageClient";

// This is your server component
export default async function ProjectsPage() {
  const projects = await getAllProjects();

  const projectsData = projects.map((project) => ({
    title: project.title,
    status: project.projectStatus,
    images: project.images?.length ? project.images : ["/assets/images/projects/p2.png"],
    slug: project.slug,
  }));

  return <ProjectsPageClient projects={projectsData} />;
}