'use client';
import { Card } from "@/components/ui/card";
import Image from "next/image";

export interface ProjectCardProps {
  title: string;
  status: string;
  images: string[];
  slug: string;
}

interface ProjectListProps {
  projects?: ProjectCardProps[];
  onProjectClick?: (slug: string) => void;
}

export function ProjectList({ projects = [], onProjectClick }: ProjectListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {projects.map((project, index) => (
        <Card
          key={index}
          onClick={() => onProjectClick?.(project.slug)}
          className="overflow-hidden flex flex-col p-0 rounded-xl border-2 bg-background
            hover:shadow-lg cursor-pointer transition"
        >
          <div className="relative w-full h-36 overflow-hidden">
            <Image
              src={project.images?.[0] || "/assets/images/projects/p2.png"}
              alt={project.title}
              fill
              className="object-cover mb-0 pb-0"
            />
          </div>
          <div className="pt-0 flex flex-col -mt-4 text-center">
            <span className="text-md font-semibold leading-none m-0 p-0">{project.title}</span>
            <span className="text-xs bg-[#9f004d] text-white font-medium rounded mt-2 px-2 py-1">
              {`Project Status: ${project.status}`}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}