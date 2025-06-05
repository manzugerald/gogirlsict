'use client';
import { Project } from "@/lib/generated/prisma";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
          <div className="flex">
            {/* Left: Image */}
            <div className="w-32 h-32 relative flex-shrink-0">
              <Image
                src={project.images[0] || "/images/placeholder.png"}
                alt={project.title}
                fill
                className="object-cover rounded-l-md"
              />
            </div>

            {/* Right: Content */}
            <CardContent className="p-4 flex flex-col justify-between space-y-2 w-full">
              <h2 className="text-lg font-semibold">{project.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-3">{project.content}</p>
              <span className="text-xs font-medium px-2 py-1 bg-secondary rounded w-fit">
                {project.status}
              </span>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
