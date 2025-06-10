import { getAllProjects } from "@/lib/actions/projects";
import { ProjectList, ProjectCardProps } from "@/components/shared/projects/project-list";
import ProjectHero from "@/components/shared/header/project-header";

export const metadata = {
  title: 'Projects'
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  
  const projectsData: ProjectCardProps[] = projects.map((project) => ({
    title: project.title,
    status: project.projectStatus,
    images: project.images?.length ? project.images : ["/assets/images/projects/p2.png"],
  }));
  return (
    <>
      <ProjectHero />
      <section className="wrapper">
        <ProjectList projects={projectsData} />
      </section>
      </>
  );
}
