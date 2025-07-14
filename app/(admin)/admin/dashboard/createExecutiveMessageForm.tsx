'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const publishOptions = ['draft', 'published'] as const;
type PublishStatus = (typeof publishOptions)[number];

type ExecutiveMessageFormProps = {
  mode?: 'create' | 'edit';
  initialData?: {
    id?: string | number;
    title: string;
    affiliated: string;
    name: string;
    message: string;
    nameImageUrl?: string;
    messageImageUrl?: string;
    messageStatus?: PublishStatus;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function CreateExecutiveMessageForm({
  mode = 'create',
  initialData,
  onSuccess,
  onCancel,
}: ExecutiveMessageFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    affiliated: '',
    name: '',
    message: '',
    nameImageUrl: '',
    messageImageUrl: '',
    messageStatus: 'draft' as PublishStatus,
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        affiliated: initialData.affiliated || '',
        name: initialData.name || '',
        message: initialData.message || '',
        nameImageUrl: initialData.nameImageUrl || '',
        messageImageUrl: initialData.messageImageUrl || '',
        messageStatus: initialData.messageStatus || 'draft',
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!form.title || !form.affiliated || !form.name || !form.message) {
      alert('All fields except images are required.');
      setLoading(false);
      return;
    }

    try {
      let res;
      if (mode === 'edit' && initialData?.id) {
        res = await fetch(`/api/executive-messages/${initialData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch('/api/executive-messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || `Failed to ${mode} executive message`;
        throw new Error(errorMessage);
      }

      if (onSuccess) onSuccess();
      router.refresh();
      router.push('/admin/dashboard');
    } catch (err) {
      alert(
        `There was an error ${mode === 'edit' ? 'updating' : 'creating'} the executive message.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (
      !window.confirm(
        'Are you sure you want to delete this executive message? This action cannot be undone.'
      )
    )
      return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/executive-messages/${initialData.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || 'Failed to delete executive message';
        throw new Error(errorMessage);
      }

      if (onSuccess) onSuccess();
      router.refresh();
      router.push('/admin/dashboard');
    } catch (err) {
      alert('There was an error deleting the executive message.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto mt-4 space-y-6 p-6 bg-background rounded-xl shadow"
    >
      <div className="text-2xl font-bold mb-4 text-center">
        {mode === 'edit' ? 'Edit Executive Message' : 'Create Executive Message'}
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={form.title} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="affiliated">Affiliated</Label>
        <Input
          id="affiliated"
          name="affiliated"
          value={form.affiliated}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          className="w-full border rounded-md p-2 min-h-[80px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nameImageUrl">Name Image URL (optional)</Label>
        <Input
          id="nameImageUrl"
          name="nameImageUrl"
          value={form.nameImageUrl}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="messageImageUrl">Message Image URL (optional)</Label>
        <Input
          id="messageImageUrl"
          name="messageImageUrl"
          value={form.messageImageUrl}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="messageStatus">Publish Status</Label>
        <select
          id="messageStatus"
          name="messageStatus"
          value={form.messageStatus}
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
      <div className="flex flex-center gap-2 w-full">
        <Button type="submit" disabled={loading} className="w-1/2 bg-[#9f004d]">
          {loading
            ? mode === 'edit'
              ? 'Updating...'
              : 'Creating...'
            : mode === 'edit'
            ? 'Update'
            : 'Create'}
        </Button>
        <Button type="button" onClick={onCancel} disabled={loading} className="w-1/2 bg-black">
          Cancel
        </Button>
        {mode === 'edit' && (
          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-1/2 bg-red-700"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        )}
      </div>
    </form>
  );
}
