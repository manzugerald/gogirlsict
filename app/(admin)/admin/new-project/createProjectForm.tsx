"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import "@/assets/styles/tiptap-editor.css";

const EditorClient = dynamic(() => import("@/components/editor/editor-client"), {
  ssr: false,
});

const projectStatusOptions = ["active", "completed", "paused"] as const;
const publishOptions = ["draft", "published"] as const;

type ProjectStatus = (typeof projectStatusOptions)[number];
type PublishStatus = (typeof publishOptions)[number];

export default function CreateProjectForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    content: {}, // Tiptap JSON document
    files: null as FileList | null,
    projectStatus: "active" as ProjectStatus,
    publishStatus: "draft" as PublishStatus,
  });
  const [loading, setLoading] = useState(false);

  // Handles all form field changes, including file uploads
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as (HTMLInputElement & HTMLSelectElement);
    if (name === "files" && files) {
      setForm((prev) => ({ ...prev, files }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Receives JSON from the editor
  const handleEditorChange = (json: object) => {
    setForm((prev) => ({ ...prev, content: json }));
  };

  // Handles form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Ensure at least one image is uploaded
    if (!form.files || form.files.length === 0) {
      alert("Please upload at least one image.");
      setLoading(false);
      return;
    }

    // Build FormData for multipart/form-data POST
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("content", JSON.stringify(form.content)); // JSON, not HTML!
    formData.append("projectStatus", form.projectStatus);
    formData.append("publishStatus", form.publishStatus);

    Array.from(form.files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/projects/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || "Failed to create project";
        throw new Error(errorMessage);
      }

      router.refresh();
      router.push("/projects");
    } catch (err) {
      alert("There was an error creating the project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto mt-4 space-y-6 p-6 bg-background rounded-xl shadow"
      encType="multipart/form-data"
    >
      <div className="text-2xl font-bold mb-4 text-center">Create New Project</div>
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
      </div>
      {/* Content (Tiptap JSON) */}
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <EditorClient
          content={form.content}
          onChange={handleEditorChange}
          showLinkUnlink
        />
      </div>
      {/* Image Upload (required, multiple allowed) */}
      <div className="space-y-2">
        <Label htmlFor="files">Image Upload (required)</Label>
        <Input
          id="files"
          name="files"
          type="file"
          accept="image/png,image/jpeg"
          multiple
          onChange={handleChange}
          required
        />
      </div>
      {/* Publish Status */}
      <div className="space-y-2">
        <Label htmlFor="publishStatus">Publish Status</Label>
        <select
          id="publishStatus"
          name="publishStatus"
          value={form.publishStatus}
          onChange={handleChange}
          className="w-full border border-input rounded-md p-2 text-sm bg-background text-foreground"
        >
          {publishOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      {/* Project Status */}
      <div className="space-y-2">
        <Label htmlFor="projectStatus">Project Status</Label>
        <select
          id="projectStatus"
          name="projectStatus"
          value={form.projectStatus}
          onChange={handleChange}
          className="w-full border border-input rounded-md p-2 text-sm bg-background text-foreground"
        >
          {projectStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Project"}
      </Button>
    </form>
  );
}