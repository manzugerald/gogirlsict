'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  mode?: "create" | "edit";
  userId?: string;
  initialData?: any; // for edit: {firstName, lastName, username, email, image, ...}
  onSuccess?: () => void;
  onCancel?: () => void;
  onDelete?: (userId: string) => void;
};

function getCameFrom() {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem('came-from') || "/";
  }
  return "/";
}

export default function CreateOrEditUserForm({
  mode = "create",
  userId,
  initialData,
  onSuccess,
  onCancel,
  onDelete,
}: Props) {
  //Defensive: don't even render the form if edit mode and userId is missing
  if (mode === "edit" && !userId) {
    //optionally: log an error, show a message, or just return null
    return <div className="text-red-500 text-center">User ID missing. Cannot edit user</div>
  }

  // Always allow editing all fields in both modes
  const [form, setForm] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    username: initialData?.username || "",
    email: initialData?.email || "",
    password: "",
    confirmPassword: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(initialData?.image || "");
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameInvalid, setUsernameInvalid] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerDot, setRegisterDot] = useState(0);

  const router = useRouter();

  // When initialData changes, update form fields and image preview (including edit mode)
  useEffect(() => {
    setForm({
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      username: initialData?.username || "",
      email: initialData?.email || "",
      password: "",
      confirmPassword: "",
    });
    setImageUrl(initialData?.image || "");
    setImagePreview(initialData?.image || null);
    setImageFile(null);
    setImageToDelete(null);
  }, [initialData]);

  // Username validation for update (must match DB for this userId)
  const handleUsernameBlur = async () => {
    if (form.username && userId && mode === "edit") {
      setCheckingUsername(true);
      const res = await fetch(`/api/users/check-exact?userId=${userId}&username=${encodeURIComponent(form.username)}`);
      const data = await res.json();
      setUsernameInvalid(!data.valid);
      setCheckingUsername(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
    if (e.target.name === "username") setUsernameInvalid(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // If editing and old image exists, mark it for deletion
      if (imageUrl) setImageToDelete(imageUrl);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageDelete = async () => {
    if (imageUrl) setImageToDelete(imageUrl);
    setImageFile(null);
    setImageUrl("");
    setImagePreview(null);
    if (userId && imageUrl) {
      await fetch("/api/users/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
    }
  };

  // Animated dots for Register/Update button
  useEffect(() => {
    let dotInterval: any;
    if (isSubmitting) {
      dotInterval = setInterval(() => {
        setRegisterDot((prev) => (prev + 1) % 3);
      }, 400);
    } else {
      setRegisterDot(0);
    }
    return () => {
      if (dotInterval) clearInterval(dotInterval);
    };
  }, [isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // --- Validation ---
    if (mode === "create") {
      if (
        !form.firstName ||
        !form.lastName ||
        !form.username ||
        !form.email ||
        !form.password ||
        !form.confirmPassword ||
        (!imageFile && !imagePreview)
      ) {
        setError("All fields and image are required");
        setIsSubmitting(false);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        setIsSubmitting(false);
        return;
      }
    } else if (mode === "edit") {
      if (form.password && form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        setIsSubmitting(false);
        return;
      }
      if (usernameInvalid) {
        setError("The Username is incorrect.");
        setIsSubmitting(false);
        return;
      }
      // No required fields in edit mode!
      if (!userId) {
        setIsSubmitting(false);
        setError("Invalid form mode or missing user ID");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("email", form.email);
      formData.append("username", form.username);
      // Only send password fields if they are filled in edit mode
      if (form.password) formData.append("password", form.password);
      if (imageFile) formData.append("image", imageFile);
      if (mode === "edit" && imageToDelete) formData.append("oldImageUrl", imageToDelete);

      let res;
      if (mode === "edit") {
        if (!userId) {
          setIsSubmitting(false);
          setError("Invalid form mode or missing user ID");
          return;
        }
        res = await fetch(`/api/users/${userId}`, {
          method: "PATCH",
          body: formData,
        });
      } else {
        res = await fetch("/api/users", {
          method: "POST",
          body: formData,
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");
      setSuccess(mode === "edit" ? "User updated!" : "User created!");

      if (mode === "create") {
        const cameFrom = getCameFrom();
        sessionStorage.removeItem('came-from');
        setTimeout(() => {
          router.push(cameFrom);
        }, 800);
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else router.back();
  };

  const handleDelete = async () => {
    if (!userId) return;
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete user");
      }
      if (onDelete) onDelete(userId);
      if (onSuccess) onSuccess();
      router.refresh();
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex max-w-lg items-center justify-center mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {/* User Image - On Top, Centered */}
        <div className="flex flex-col items-center">
          {imagePreview ? (
            <div className="relative flex flex-col items-center">
              <img src={imagePreview} alt="User" className="w-24 h-24 rounded-full object-cover border mx-auto" />
              <button
                type="button"
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center -mt-2 -mr-2"
                onClick={handleImageDelete}
                title="Delete Image"
              >×</button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full border flex items-center justify-center mb-2 text-gray-400">No Image</div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2 mb-2 block"
          />
        </div>

        {/* First Name and Last Name, same row */}
        <div className="flex gap-4">
          <input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            className="border p-2 rounded w-1/2"
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            className="border p-2 rounded w-1/2"
          />
        </div>

        {/* Username and Email, same row */}
        <div className="flex gap-4">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            onBlur={mode === "edit" ? handleUsernameBlur : undefined}
            className={`border p-2 rounded w-1/2 ${usernameInvalid ? "border-red-500" : ""}`}
            autoComplete="off"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border p-2 rounded w-1/2"
            autoComplete="off"
          />
        </div>
        {checkingUsername && mode === "edit" && <span className="text-xs block">Checking username…</span>}
        {usernameInvalid && mode === "edit" && (
          <span className="text-xs text-red-500 block">The Username is incorrect.</span>
        )}

        {/* Password and Confirm Password, same row */}
        <div className="flex gap-4">
          <input
            type="password"
            name="password"
            placeholder={mode === "edit" ? "New Password" : "Password"}
            onChange={handleChange}
            value={form.password}
            className="border p-2 rounded w-1/2"
            autoComplete="new-password"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder={mode === "edit" ? "Confirm New Password" : "Confirm Password"}
            onChange={handleChange}
            value={form.confirmPassword}
            className="border p-2 rounded w-1/2"
            autoComplete="new-password"
          />
        </div>
        {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
          <span className="text-xs text-red-500 block">Passwords do not match</span>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            className="w-1/2 bg-green-600 text-white py-2 rounded flex items-center justify-center"
            disabled={isSubmitting || checkingUsername || usernameInvalid || (form.password && form.password !== form.confirmPassword)}
          >
            {mode === "edit" ? "Update User" : "Register"}
            {isSubmitting && (
              <span className="ml-2 flex">
                {[0,1,2].map(i => (
                  <span key={i} className={`transition-all w-1.5 h-1.5 rounded-full mx-0.5 inline-block ${registerDot === i ? "bg-white" : "bg-green-900 opacity-40"}`}></span>
                ))}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="w-1/2 bg-black text-white py-2 rounded"
            disabled={deleting}
          >
            Cancel
          </button>
        </div>
        {mode === "edit" && userId && (
          <button
            type="button"
            onClick={handleDelete}
            className="w-full bg-red-600 text-white py-2 rounded mt-2"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete User"}
          </button>
        )}
      </form>
    </div>
  );
}