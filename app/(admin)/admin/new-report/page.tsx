"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const publishOptions = ["draft", "published"] as const;
type PublishStatus = (typeof publishOptions)[number];

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/reports/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("File upload failed");
  }

  const { path } = await res.json();
  return path as string;
}

export default function CreateReportForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    publishStatus: "draft" as PublishStatus,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPdfFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images
      const imagePaths = await Promise.all(
        imageFiles.map(file => uploadFile(file))
      );
      // Upload PDFs
      const pdfPaths = await Promise.all(
        pdfFiles.map(file => uploadFile(file))
      );

      const payload = {
        title: form.title.trim(),
        images: imagePaths,
        files: pdfPaths,
        publishStatus: form.publishStatus,
        accessCount: 0,
        downloadCount: 0,
      };

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || "Failed to create report";
        throw new Error(errorMessage);
      }

      router.refresh();
      router.push("/admin");
    } catch (err) {
      console.error("Error creating report:", err);
      alert("There was an error creating the report. Please try again.");
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
        <Label htmlFor="images">Images (PNG, JPG, JPEG)</Label>
        <Input
          id="images"
          name="images"
          type="file"
          accept=".png,.jpg,.jpeg"
          multiple
          onChange={handleImageChange}
        />
        <div className="text-xs text-muted-foreground">
          {imageFiles.map((file) => file.name).join(", ")}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="files">PDF Files</Label>
        <Input
          id="files"
          name="files"
          type="file"
          accept=".pdf"
          multiple
          onChange={handlePdfChange}
        />
        <div className="text-xs text-muted-foreground">
          {pdfFiles.map((file) => file.name).join(", ")}
        </div>
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
        {loading ? "Creating..." : "Create Report"}
      </Button>
    </form>
  );
}