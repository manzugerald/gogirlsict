'use client';
import { useState } from "react";
import { ProjectList, ProjectCardProps } from "@/components/shared/projects/project-list";
import ProjectHero from "@/components/shared/header/project-header";
import dynamic from "next/dynamic";

const ProjectDetails = dynamic(() => import("@/components/shared/projects/project-details"), { ssr: false, loading: () => <div>Loading project...</div> });

export default function ProjectsPageClient({ projects }: { projects: ProjectCardProps[] }) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  if (selectedProject) {
    return (
      <>
        <ProjectDetails slug={selectedProject} onBack={() => setSelectedProject(null)} />
      </>
    );
  }

  return (
    <>
      <ProjectHero />
      <section className="wrapper">
        <ProjectList
          projects={projects}
          onProjectClick={(slug) => setSelectedProject(slug)}
        />
      </section>
    </>
  );
}