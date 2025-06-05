"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn, slugify } from "@/lib/utils";

const statusOptions = ["active", "completed", "paused"] as const;

export default function CreateProjectForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    content: "",
    status: "active",
    images: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const slug = slugify(form.title);
    const payload = {
      ...form,
      slug,
      images: form.images.split(",").map((img) => img.trim()),
    };

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create project");

      router.refresh();
      router.push("/projects");
    } catch (err) {
      console.error("Error creating project:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 p-6 bg-background rounded-xl shadow">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={form.title} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" name="content" value={form.content} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Images (comma-separated URLs)</Label>
        <Input id="images" name="images" value={form.images} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border border-input rounded-md p-2 text-sm bg-background text-foreground"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Project"}
      </Button>
    </form>
  );
}
