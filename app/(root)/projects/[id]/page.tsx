'use client';
import ProjectDetails from "@/components/shared/projects/project-details";
import ProjectHero from "@/components/shared/header/project-header";
import { useRouter } from "next/navigation";
import { use } from "react";


export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id }= use(params);
  return (
    <>
      <ProjectHero />
      <ProjectDetails
      id={Number(id)}
      onBack={() => router.push("/projects")}
    />
    </>
  );
}