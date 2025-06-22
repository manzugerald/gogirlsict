"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const publishOptions = ["draft", "published"] as const;
type PublishStatus = (typeof publishOptions)[number];
type Mode = "create" | "edit";
interface ReportData {
  id?: string;
  title: string;
  images?: string[];
  files?: string[];
  publishStatus: PublishStatus;
  accessCount?: number;
  downloadCount?: number;
}

interface CreateReportFormProps {
  mode: Mode;
  initialData?: ReportData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

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

export default function CreateReportForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: CreateReportFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<ReportData>({
    title: initialData?.title || "",
    publishStatus: initialData?.publishStatus || "draft",
  });
  // Store which existing images/files are marked for deletion
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [existingFiles, setExistingFiles] = useState<string[]>(initialData?.files || []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        title: initialData.title || "",
        publishStatus: initialData.publishStatus || "draft",
      });
      setExistingImages(initialData.images || []);
      setExistingFiles(initialData.files || []);
    }
  }, [mode, initialData]);

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

  const handleRemoveExistingImage = (path: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== path));
  };

  const handleRemoveExistingFile = (path: string) => {
    setExistingFiles((prev) => prev.filter((file) => file !== path));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload new images
      const imagePaths = await Promise.all(
        imageFiles.map(file => uploadFile(file))
      );
      // Upload new PDFs
      const pdfPaths = await Promise.all(
        pdfFiles.map(file => uploadFile(file))
      );

      // Compose images/files: keep those not deleted (existing), add new ones
      const imagesToSubmit = [...existingImages, ...imagePaths];
      const filesToSubmit = [...existingFiles, ...pdfPaths];

      const payload: ReportData = {
        title: form.title.trim(),
        images: imagesToSubmit,
        files: filesToSubmit,
        publishStatus: form.publishStatus,
        accessCount: initialData?.accessCount || 0,
        downloadCount: initialData?.downloadCount || 0,
      };

      let res;
      if (mode === "edit" && initialData?.id) {
        res = await fetch(`/api/reports/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || (mode === "edit" ? "Failed to update report" : "Failed to create report");
        throw new Error(errorMessage);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
        router.push("/admin");
      }
    } catch (err) {
      console.error("Error saving report:", err);
      alert(`There was an error ${mode === "edit" ? "updating" : "creating"} the report. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-6 p-6 bg-background rounded-xl shadow"
    >
      <h2 className="font-semibold text-xl mb-4">
        {mode === "edit" ? "Edit Report" : "Create New Report"}
      </h2>
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

      {/* Existing images (for edit) */}
      {mode === "edit" && initialData?.images && initialData.images.length > 0 && (
        <div className="space-y-2">
          <Label>Existing Images</Label>
          <div className="flex flex-wrap gap-2">
            {existingImages.map((img, idx) => (
              <div key={img+idx} className="flex items-center gap-1">
                <a href={img} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">{img.split("/").pop()}</a>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="ml-1 px-2 py-0 text-xs"
                  onClick={() => handleRemoveExistingImage(img)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Existing PDF files (for edit) */}
      {mode === "edit" && initialData?.files && initialData.files.length > 0 && (
        <div className="space-y-2">
          <Label>Existing PDF Files</Label>
          <div className="flex flex-wrap gap-2">
            {existingFiles.map((file, idx) => (
              <div key={file+idx} className="flex items-center gap-1">
                <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">{file.split("/").pop()}</a>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="ml-1 px-2 py-0 text-xs"
                  onClick={() => handleRemoveExistingFile(file)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#9f004d] hover:bg-[#7c003c] text-white"
        >
          {loading
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
            ? "Update Report"
            : "Create Report"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-[#9f004d] text-[#9f004d] hover:bg-[#f5e3ec]"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}