'use client';
import Image from 'next/image';
import clsx from 'clsx';
import { cardHoverClass } from '@/utils/styles/card-hover';
import TiptapJsonViewer from '@/components/editor/tiptap-json-viewer';

export interface ProjectCardProps {
  id: number;
  title: string;
  status: string;
  images: string[];
  content: string;
}

interface ProjectListProps {
  projects?: any[];
  onProjectClick?: (id: number) => void;
}

export function ProjectList({ projects = [], onProjectClick }: ProjectListProps) {
  const mappedProjects: ProjectCardProps[] = projects.map((project) => ({
    id: project.id,
    title: project.title,
    status: project.projectStatus,
    images: project.images,
    content: project.content,
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto my-10 px-2">
      {mappedProjects.map((project, idx) => {
        let tiptapContent: object | null = null;
        try {
          tiptapContent =
            typeof project.content === 'string' ? JSON.parse(project.content) : project.content;
        } catch {
          tiptapContent = null;
        }

        return (
          <div
            key={project.id || idx}
            onClick={() => onProjectClick?.(project.id)}
            className={clsx('flex flex-col w-full group min-h-0', cardHoverClass)}
          >
            <div className="relative w-full" style={{ maxHeight: '15rem', minHeight: '15rem' }}>
              <Image
                src={project.images?.[0] || '/assets/images/projects/p2.png'}
                alt={project.title}
                fill
                className="object-cover rounded-t-xl group-hover:shadow-lg transition-shadow duration-300"
              />
            </div>
            <div className="flex flex-col p-4 pb-3 flex-1">
              <div className="mb-1 flex flex-col items-center">
                <span className="font-extrabold text-pink-600 dark:text-pink-400 text-base text-center">
                  {project.title}
                </span>
              </div>
              <p className="text-gray-800 dark:text-gray-100 text-sm font-medium drop-shadow-sm mb-1 text-center whitespace-pre-line">
                {`Status: ${project.status ?? 'N/A'}`}
              </p>

              {/* TipTap content preview */}
              <div className="prose dark:prose-invert text-xs mt-2 line-clamp-3 max-h-[5rem] overflow-hidden">
                {tiptapContent ? (
                  <TiptapJsonViewer
                    content={tiptapContent}
                    className="prose dark:prose-invert text-xs"
                  />
                ) : (
                  <p className="italic text-muted-foreground text-center">No preview available</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
