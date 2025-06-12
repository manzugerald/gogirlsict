'use client';

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import LightGallery from 'lightgallery/react';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import lgAutoplay from 'lightgallery/plugins/autoplay';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-autoplay.css';

import ImageSlider from "../images/image-slider";
import LightGalleryGrid from "../images/light-gallery";

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

  return (
    <>
      {/* Full-width slider */}
      {images.length > 0 ? (
        <div className="w-full">
          <ImageSlider images={images} />
        </div>
      ) : (
        <p>No images available</p>
      )}

      {/* Main content below slider */}
      <div className="max-w-5xl mx-auto p-6">
        <button onClick={onBack} className="text-sm text-blue-600 underline mb-4">
          ← Back to Projects
        </button>
        
        {/* Markdown content */}
        <h1 className="text-2xl font-bold mt-8">{project.title}</h1>
        {project.content && typeof project.content === "string" && (
          <div className="prose mt-6 max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      <LightGalleryGrid images={images} title={project.title} />
    </>
  );
}
