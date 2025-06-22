'use client';

import { useEffect, useState } from "react";
import ImageSlider from "../images/image-slider";
import LightGalleryGrid from "../images/light-gallery";
import TiptapJsonViewer from "@/components/editor/tiptap-json-viewer";
import TitleHeader from "../title/title";

interface ProjectDetailsProps {
  id: number;
  onBack: () => void;
}

export default function ProjectDetails({ id, onBack }: ProjectDetailsProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/projects/${id}`)
      .then(res => res.json())
      .then(data => {
        setProject(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading project:", err);
        setLoading(false);
      });
  }, [id]);

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
    <div className="wrapper bg-background text-foreground min-h-screen transition-colors max-w-5xl mx-auto px-4">
      {/* Full-width slider */}
      {/* {images.length > 0 ? (
        <div className="w-full">
          <ImageSlider images={images} />
        </div>
      ) : (
        <p>No images available</p>
      )} */}

      {/* Main content below slider */}
      <div className="max-w-5xl mx-auto p-6 mt-0 pt-0">
        
          {/* {images.length > 0 ? (
            <div className="w-full">
              <ImageSlider images={images} />
            </div>
            ) : (
            <p>No images available</p>
          )} */}
        <TitleHeader
          title={project.title}
          authorName="Eva Yayi"
          postDate="Monday, June 16 2025"
          authorRole="Admin"
          authorImageUrl="/assets/images/users/evayayi.jpg"
        />
        <button onClick={onBack} className="text-sm text-blue-600 underline m-2">
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
        <LightGalleryGrid images={images} title={project.title} />
      </div>
    </div>
  );
}