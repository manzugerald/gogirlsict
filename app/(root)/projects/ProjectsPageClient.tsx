"use client";
import { useRouter } from "next/navigation";
import ProjectHero from "@/components/shared/header/project-header";
import { ProjectList } from "@/components/shared/projects/project-list";

export default function ProjectsPageClient({ projects }) {
  const router = useRouter();

  return (
    <>
      <ProjectHero />
      <section className="wrapper">
        <ProjectList
          projects={projects}
          onProjectClick={(id) => router.push(`/projects/${id}`)}
        />
      </section>
    </>
  );
}