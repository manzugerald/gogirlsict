'use client';
import { Card } from "@/components/ui/card";
import Image from "next/image";

export interface ProjectCardProps {
  title: string;
  status: string;
  images: string[];
}

interface ProjectListProps {
  projects: ProjectCardProps[];
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {projects.map((project, index) => (
        <Card key={index} className="overflow-hidden flex flex-col p-0">
          {/* Image flush at the top */}
          <div className="relative w-full h-36 overflow-hidden">
            <Image
              src={project.images?.[0]}
              alt={project.title}
              fill
              className="object-cover mb-0 pb-0"
            />
          </div>

          {/* Content with no space above */}
          <div className="pt-0 flex flex-col -mt-4 text-center">
            <span className="text-md font-semibold leading-none m-0 p-0">{project.title}</span>
              <span className="text-xs bg-pink-600 font-medium rounded mt-2 px-2 py-1">
                {`Project Status: ${project.status}`}
              </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
