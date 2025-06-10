"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils";

const projectStatusOptions = ["active", "completed", "paused"] as const;
const publishOptions = ["draft", "published"] as const;

type ProjectStatus = (typeof projectStatusOptions)[number];
type PublishStatus = (typeof publishOptions)[number];

export default function CreateProjectForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    content: "",
    images: "",
    projectStatus: "active" as ProjectStatus,
    publishStatus: "draft" as PublishStatus,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const slug = slugify(form.title.trim());

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      slug,
      images: form.images.split(",").map((img) => img.trim()).filter(Boolean),
      projectStatus: form.projectStatus,
      publishStatus: form.publishStatus,
    };

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || "Failed to create project";
        throw new Error(errorMessage);
      }

      router.refresh();
      router.push("/projects");
    } catch (err) {
      console.error("Error creating project:", err);
      alert("There was an error creating the project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-6 p-6 bg-background rounded-xl shadow"
    >
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

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          value={form.content}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Images (comma-separated URLs)</Label>
        <Input
          id="images"
          name="images"
          value={form.images}
          onChange={handleChange}
          placeholder="https://image1.jpg, https://image2.jpg"
        />
      </div>

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

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Project"}
      </Button>
    </form>
  );
}
