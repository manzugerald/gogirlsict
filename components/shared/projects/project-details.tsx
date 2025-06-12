'use client';

import { useEffect, useState } from "react";
import ImageSlider from "../images/image-slider";
import LightGalleryGrid from "../images/light-gallery";
import TiptapJsonViewer from "@/components/editor/tiptap-json-viewer";

interface ProjectDetailsProps {
  slug: string;
  onBack: () => void;
}

export default function ProjectDetails({ slug, onBack }: ProjectDetailsProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/projects/${slug}`)
      .then(res => res.json())
      .then(data => {
        setProject(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading project:", err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found.</div>;

  const images = project.images?.length ? project.images : ["/assets/images/projects/p2.png"];

  // Make sure content is a JSON object
  let tiptapContent: object | null = null;
  try {
    tiptapContent = typeof project.content === "string"
      ? JSON.parse(project.content)
      : project.content;
  } catch {
    tiptapContent = null;
  }

  return (
    <div className="bg-background text-foreground min-h-screen transition-colors">
      {/* Full-width slider */}
      {images.length > 0 ? (
        <div className="w-full">
          <ImageSlider images={images} />
        </div>
      ) : (
        <p>No images available</p>
      )}

      {/* Main content below slider */}
      <div className="wrapper max-w-5xl mx-auto p-6">
        <button onClick={onBack} className="text-sm text-blue-600 underline mb-4">
          ← Back to Projects
        </button>

        <h1 className="text-2xl font-bold mt-8">{project.title}</h1>
        <div className="prose dark:prose-invert mt-6 max-w-none">
          {tiptapContent ? (
            <TiptapJsonViewer content={tiptapContent} className="prose dark:prose-invert" />
          ) : (
            <div className="text-red-500">Error displaying content.</div>
          )}
        </div>
      </div>
      <LightGalleryGrid images={images} title={project.title} />
    </div>
  );
}