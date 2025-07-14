'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type HomePageFormProps = {
  mode?: 'create' | 'edit';
  initialData?: {
    id?: string | number;
    heroVideo: string;
    vision: string;
    mission: string;
    focus: string;
    coreValues: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function CreateHomepageForm({
  mode = 'create',
  initialData,
  onSuccess,
  onCancel,
}: HomePageFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    heroVideo: '',
    vision: '',
    mission: '',
    focus: '',
    coreValues: '',
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        heroVideo: initialData.heroVideo || '',
        vision: initialData.vision || '',
        mission: initialData.mission || '',
        focus: initialData.focus || '',
        coreValues: initialData.coreValues || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!form.heroVideo || !form.vision || !form.mission || !form.focus || !form.coreValues) {
      alert('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      let res;
      if (mode === 'edit' && initialData?.id) {
        res = await fetch(`/api/homepage-content/${initialData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch('/api/homepage-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || `Failed to ${mode} homepage`;
        throw new Error(errorMessage);
      }

      if (onSuccess) onSuccess();
      router.refresh();
      router.push('/admin/dashboard');
    } catch (err) {
      alert(`There was an error ${mode === 'edit' ? 'updating' : 'creating'} the homepage.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (
      !window.confirm(
        'Are you sure you want to delete this homepage content? This action cannot be undone.'
      )
    )
      return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/homepage-content/${initialData.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || 'Failed to delete homepage';
        throw new Error(errorMessage);
      }

      if (onSuccess) onSuccess();
      router.refresh();
      router.push('/admin/dashboard');
    } catch (err) {
      alert('There was an error deleting the homepage content.');
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
        {mode === 'edit' ? 'Edit Home Page Content' : 'Create Home Page Content'}
      </div>
      <div className="space-y-2">
        <Label htmlFor="heroVideo">Hero Video (URL)</Label>
        <Input
          id="heroVideo"
          name="heroVideo"
          value={form.heroVideo}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vision">Vision</Label>
        <textarea
          id="vision"
          name="vision"
          value={form.vision}
          onChange={handleChange}
          required
          className="w-full border rounded-md p-2 min-h-[60px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mission">Mission</Label>
        <textarea
          id="mission"
          name="mission"
          value={form.mission}
          onChange={handleChange}
          required
          className="w-full border rounded-md p-2 min-h-[60px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="focus">Focus</Label>
        <textarea
          id="focus"
          name="focus"
          value={form.focus}
          onChange={handleChange}
          required
          className="w-full border rounded-md p-2 min-h-[60px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="coreValues">Core Values</Label>
        <textarea
          id="coreValues"
          name="coreValues"
          value={form.coreValues}
          onChange={handleChange}
          required
          className="w-full border rounded-md p-2 min-h-[60px]"
        />
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
// This code defines a form for creating or editing the homepage content of a website.
// It includes fields for a hero video URL, vision, mission, focus, and core values.
// The form handles both creation and editing modes, with appropriate API calls for each.