'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import '@/assets/styles/tiptap-editor.css';

const EditorClient = dynamic(() => import('@/components/editor/editor-client'), {
  ssr: false,
});

const eventStatusOptions = ['pending', 'ongoing', 'completed', 'paused'] as const;
const publishOptions = ['draft', 'published'] as const;
const attendanceOptions = ['public', 'registration_required'] as const;

type EventStatus = (typeof eventStatusOptions)[number];
type PublishStatus = (typeof publishOptions)[number];
type AttendanceType = (typeof attendanceOptions)[number];

type EventFormProps = {
  mode?: 'create' | 'edit';
  initialData?: {
    id?: string;
    eventTitle: string;
    eventDescription: object;
    eventDetails?: object;
    eventLocation?: string;
    eventBanner: string; // string (URL or empty)
    eventImages: string[];
    eventFile: string;
    eventStartDate: string;
    eventEndDate: string;
    eventTags: string[];
    eventStatus: EventStatus;
    publishStatus: PublishStatus;
    eventAttendance: AttendanceType;
    maxAttendees?: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  currentUserId?: string;
};

export default function CreateEventForm({
  mode = 'create',
  initialData,
  onSuccess,
  onCancel,
  currentUserId,
}: EventFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    eventTitle: '',
    eventDescription: {},
    eventDetails: {},
    eventLocation: '',
    eventBanner: '', // string (URL or empty)
    eventImages: [] as string[],
    eventFile: '',
    eventStartDate: '',
    eventEndDate: '',
    eventTags: [] as string[],
    eventStatus: 'pending' as EventStatus,
    publishStatus: 'draft' as PublishStatus,
    eventAttendance: 'public' as AttendanceType,
    maxAttendees: '',
    files: null as FileList | null,
    bannerFile: null as File | null,
    eventFileUpload: null as File | null,
  });
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [fileToRemove, setFileToRemove] = useState<string | null>(null);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initialData) {
      console.log('initialData.eventBanner:', initialData.eventBanner);
      const toDatetimeLocal = (s: string | undefined) =>
        s ? new Date(s).toISOString().slice(0, 16) : '';
      setForm({
        eventTitle: initialData.eventTitle ?? '',
        eventDescription: initialData.eventDescription ?? {},
        eventDetails: initialData.eventDetails ?? {},
        eventLocation: initialData.eventLocation ?? '',
        eventBanner: initialData.eventBanner ?? '',
        eventImages: Array.isArray(initialData.eventImages) ? initialData.eventImages : [],
        eventFile: initialData.eventFile ?? '',
        eventStartDate: toDatetimeLocal(initialData.eventStartDate),
        eventEndDate: toDatetimeLocal(initialData.eventEndDate),
        eventTags: Array.isArray(initialData.eventTags) ? initialData.eventTags : [],
        eventStatus: initialData.eventStatus ?? 'pending',
        publishStatus: initialData.publishStatus ?? 'draft',
        eventAttendance: initialData.eventAttendance ?? 'public',
        maxAttendees:
          typeof initialData.maxAttendees === 'number'
            ? initialData.maxAttendees.toString()
            : initialData.maxAttendees ?? '',
        files: null,
        bannerFile: null,
        eventFileUpload: null,
      });
      setFileToRemove(null);
      setImagesToRemove([]);
      setRemoveBanner(false);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement & HTMLSelectElement;
    if (name === 'files' && files) {
      setForm((prev) => ({ ...prev, files }));
    } else if (name === 'bannerFile' && files && files[0]) {
      setForm((prev) => ({ ...prev, bannerFile: files[0] }));
    } else if (name === 'eventFileUpload' && files && files[0]) {
      setForm((prev) => ({ ...prev, eventFileUpload: files[0] }));
    } else if (name === 'eventTags') {
      setForm((prev) => ({ ...prev, eventTags: value.split(',').map((t) => t.trim()) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditorChange = (json: object) => {
    setForm((prev) => ({ ...prev, eventDescription: json }));
  };

  const handleDetailsEditorChange = (json: object) => {
    setForm((prev) => ({ ...prev, eventDetails: json }));
  };

  const handleRemoveImage = (url: string) => {
    setImagesToRemove((prev) => [...prev, url]);
    setForm((prev) => ({
      ...prev,
      eventImages: prev.eventImages.filter((img) => img !== url),
    }));
  };

  const handleRemoveBanner = () => {
    setRemoveBanner(true);
    setForm((prev) => ({
      ...prev,
      eventBanner: '',
    }));
  };

  const handleRemoveFile = () => {
    setFileToRemove(form.eventFile);
    setForm((prev) => ({
      ...prev,
      eventFile: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'create' && !form.bannerFile) {
      alert('Please upload an event banner image.');
      setLoading(false);
      return;
    }

    if (!form.eventStartDate || !form.eventEndDate) {
      alert('Please provide both event start and end dates.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('eventTitle', form.eventTitle.trim());
    formData.append('eventDescription', JSON.stringify(form.eventDescription));
    formData.append('eventDetails', JSON.stringify(form.eventDetails));
    formData.append('eventLocation', form.eventLocation);
    formData.append('eventStartDate', form.eventStartDate);
    formData.append('eventEndDate', form.eventEndDate);
    formData.append('eventTags', JSON.stringify(form.eventTags));
    formData.append('eventStatus', form.eventStatus);
    formData.append('publishStatus', form.publishStatus);
    formData.append('eventAttendance', form.eventAttendance);
    formData.append('maxAttendees', form.maxAttendees);

    if (mode === 'edit') {
      formData.append('eventImages', JSON.stringify(form.eventImages));
      formData.append('imagesToRemove', JSON.stringify(imagesToRemove));
      if (fileToRemove) {
        formData.append('fileToRemove', fileToRemove);
      }
      formData.append('eventBanner', removeBanner ? '' : form.eventBanner);
    }

    if (form.bannerFile) {
      formData.append('bannerFile', form.bannerFile);
    }
    if (form.files && form.files.length > 0) {
      Array.from(form.files).forEach((file) => {
        formData.append('files', file);
      });
    }
    if (form.eventFileUpload) {
      formData.append('eventFileUpload', form.eventFileUpload);
    }

    try {
      let res;
      if (mode === 'edit' && initialData?.id) {
        res = await fetch(`/api/events/${initialData.id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        res = await fetch('/api/events/upload', {
          method: 'POST',
          body: formData,
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || `Failed to ${mode} event`;
        throw new Error(errorMessage);
      }

      if (onSuccess) onSuccess();
      router.refresh();
      router.push('/admin/dashboard');
    } catch (err) {
      alert(
        `There was an error ${
          mode === 'edit' ? 'updating' : 'creating'
        } the event. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (
      !window.confirm('Are you sure you want to delete this event? This action cannot be undone.')
    )
      return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${initialData.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || 'Failed to delete event';
        throw new Error(errorMessage);
      }

      if (onSuccess) onSuccess();
      router.refresh();
      router.push('/admin/dashboard');
    } catch (err) {
      alert('There was an error deleting the event. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto mt-4 space-y-6 p-6 bg-background rounded-xl shadow"
      encType="multipart/form-data"
    >
      <div className="text-2xl font-bold mb-4 text-center">
        {mode === 'edit' ? 'Edit Event' : 'Create New Event'}
      </div>
      {/* Event Title */}
      <div className="space-y-2">
        <Label htmlFor="eventTitle">Title</Label>
        <Input
          id="eventTitle"
          name="eventTitle"
          value={form.eventTitle}
          onChange={handleChange}
          required
        />
      </div>
      {/* Event Description (Tiptap JSON) */}
      <div className="space-y-2">
        <Label htmlFor="eventDescription">Description</Label>
        <EditorClient
          key={form.eventTitle + '_desc'}
          content={form.eventDescription}
          onChange={handleEditorChange}
          showLinkUnlink
        />
      </div>
      {/* Event Details (optional Tiptap JSON) */}
      <div className="space-y-2">
        <Label htmlFor="eventDetails">Additional Details</Label>
        <EditorClient
          key={form.eventTitle + '_details'}
          content={form.eventDetails}
          onChange={handleDetailsEditorChange}
          showLinkUnlink
        />
      </div>
      {/* Event Location */}
      <div className="space-y-2">
        <Label htmlFor="eventLocation">Location</Label>
        <Input
          id="eventLocation"
          name="eventLocation"
          value={form.eventLocation}
          onChange={handleChange}
          required
        />
      </div>
      {/* Banner Upload */}
      <div className="space-y-2">
        <Label htmlFor="bannerFile">
          {mode === 'edit'
            ? 'Banner Image (optional, will replace current)'
            : 'Banner Image (required)'}
        </Label>
        <Input
          id="bannerFile"
          name="bannerFile"
          type="file"
          accept="image/*"
          onChange={handleChange}
          required={mode === 'create'}
        />
      </div>
      {/* Current Banner (edit mode) */}
      {mode === 'edit' && form.eventBanner && !removeBanner && (
        <div className="space-y-2">
          <Label>Current Banner Image</Label>
          <div className="relative w-fit">
            <img
              src={form.eventBanner}
              alt="Current Event Banner"
              className="w-full max-w-xs object-cover rounded border"
            />
            <button
              type="button"
              className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
              onClick={handleRemoveBanner}
              title="Remove banner"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {/* Existing Images (edit mode) */}
      {mode === 'edit' && form.eventImages && form.eventImages.length > 0 && (
        <div className="space-y-2">
          <Label>Current Images</Label>
          <div className="flex flex-wrap gap-4">
            {form.eventImages.map((img) => (
              <div key={img} className="relative">
                <img src={img} alt="Event" className="w-24 h-24 object-cover rounded border" />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  onClick={() => handleRemoveImage(img)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Upload event images */}
      <div className="space-y-2">
        <Label htmlFor="files">
          {mode === 'edit'
            ? 'Event Images (optional, will add/replace)'
            : 'Event Images (optional)'}
        </Label>
        <Input
          id="files"
          name="files"
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
        />
      </div>
      {/* Existing Event File (edit mode) */}
      {mode === 'edit' && form.eventFile && (
        <div className="space-y-2">
          <Label>Current Event File</Label>
          <div className="flex items-center gap-2">
            <a
              href={form.eventFile}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              {form.eventFile.split('/').pop()}
            </a>
            <button
              type="button"
              className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
              onClick={handleRemoveFile}
              title="Remove file"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {/* Event File Upload */}
      <div className="space-y-2">
        <Label htmlFor="eventFileUpload">Event File (optional, e.g. PDF, DOCX)</Label>
        <Input
          id="eventFileUpload"
          name="eventFileUpload"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
        />
      </div>
      {/* Start Date */}
      <div className="space-y-2">
        <Label htmlFor="eventStartDate">Start Date</Label>
        <Input
          id="eventStartDate"
          name="eventStartDate"
          type="datetime-local"
          value={form.eventStartDate}
          onChange={handleChange}
          required
        />
      </div>
      {/* End Date */}
      <div className="space-y-2">
        <Label htmlFor="eventEndDate">End Date</Label>
        <Input
          id="eventEndDate"
          name="eventEndDate"
          type="datetime-local"
          value={form.eventEndDate}
          onChange={handleChange}
          required
        />
      </div>
      {/* Event Tags */}
      <div className="space-y-2">
        <Label htmlFor="eventTags">Event Tags (comma separated)</Label>
        <Input
          id="eventTags"
          name="eventTags"
          value={form.eventTags.join(',')}
          onChange={handleChange}
          placeholder="e.g. tech, leadership, youth"
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
      {/* Event Status */}
      <div className="space-y-2">
        <Label htmlFor="eventStatus">Event Status</Label>
        <select
          id="eventStatus"
          name="eventStatus"
          value={form.eventStatus}
          onChange={handleChange}
          className="w-full border border-input rounded-md p-2 text-sm bg-background text-foreground"
        >
          {eventStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      {/* Attendance */}
      <div className="space-y-2">
        <Label htmlFor="eventAttendance">Attendance Type</Label>
        <select
          id="eventAttendance"
          name="eventAttendance"
          value={form.eventAttendance}
          onChange={handleChange}
          className="w-full border border-input rounded-md p-2 text-sm bg-background text-foreground"
        >
          {attendanceOptions.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>
      {/* Max Attendees */}
      <div className="space-y-2">
        <Label htmlFor="maxAttendees">Maximum Attendees (optional)</Label>
        <Input
          id="maxAttendees"
          name="maxAttendees"
          type="number"
          min={1}
          value={form.maxAttendees}
          onChange={handleChange}
        />
      </div>
      {/* Form actions */}
      <div className="flex flex-center gap-2 w-full">
        <Button type="submit" disabled={loading} className="w-1/3 bg-[#9f004d]">
          {loading
            ? mode === 'edit'
              ? 'Updating...'
              : 'Creating...'
            : mode === 'edit'
            ? 'Update Event'
            : 'Create Event'}
        </Button>
        <Button type="button" onClick={onCancel} disabled={loading} className="w-1/3 bg-black">
          Cancel
        </Button>
        {mode === 'edit' && (
          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-1/3 bg-red-700"
          >
            {deleting ? 'Deleting Event...' : 'Delete Event'}
          </Button>
        )}
      </div>
    </form>
  );
}
