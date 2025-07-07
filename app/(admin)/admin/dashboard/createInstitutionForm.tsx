'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import '@/assets/styles/tiptap-editor.css';

const institutionTypeOptions = [
  'education',
  'faith_based_organization',
  'local_community',
  'ngo',
  'government',
  'other',
] as const;

type InstitutionType = (typeof institutionTypeOptions)[number];

type LocationFormType = {
  id?: string;
  locationName: string;
  latitude: string;
  longitude: string;
};

type InstitutionFormProps = {
  mode?: 'create' | 'edit';
  initialData?: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    logo?: string;
    institutionImages?: string[];
    headName?: string;
    institutionType: InstitutionType;
    locations?: {
      id?: string;
      locationName?: string;
      latitude?: number;
      longitude?: number;
    }[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
};

const EMAIL_LABEL = 'Email: example@example.org or example@example.com, etc';
const PHONE_LABEL =
  'Phone: Must contain a country code (e.g. +211..., +256..., 00254..., etc) and more than 8 digits';
const INSTITUTION_LABEL = 'Institution Name: GoGirls ICT Initiative, etc';
const HEAD_LABEL = 'Head Name: Nyoka Nawani Deng, etc';

function validateEmail(email: string): boolean {
  return /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(email);
}
function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '');
  if (
    (cleaned.startsWith('+') || cleaned.startsWith('00')) &&
    cleaned.replace(/\D/g, '').length >= 9
  ) {
    return true;
  }
  return false;
}
function validateName(name: string): boolean {
  return name.trim().length > 2;
}
function validateHeadName(head: string): boolean {
  return /^[A-Za-z\s\-\.]{6,}$/.test(head.trim());
}

export default function CreateInstitutionForm({
  mode = 'create',
  initialData,
  onSuccess,
  onCancel,
}: InstitutionFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    logoFile: null as File | null,
    headName: '',
    institutionType: 'education' as InstitutionType,
    files: null as FileList | null,
    institutionImages: [] as string[],
    logo: '',
    locations: [
      {
        id: undefined,
        locationName: '',
        latitude: '',
        longitude: '',
      },
    ] as LocationFormType[],
  });
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        logo: initialData.logo || '',
        logoFile: null,
        headName: initialData.headName || '',
        institutionType: initialData.institutionType || 'education',
        institutionImages: initialData.institutionImages || [],
        locations:
          initialData.locations && initialData.locations.length > 0
            ? initialData.locations.map((loc) => ({
                id: loc.id,
                locationName: loc.locationName || '',
                latitude: loc.latitude?.toString() || '',
                longitude: loc.longitude?.toString() || '',
              }))
            : [
                {
                  id: undefined,
                  locationName: '',
                  latitude: '',
                  longitude: '',
                },
              ],
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement & HTMLSelectElement;
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'files' && files) {
      setForm((prev) => ({ ...prev, files }));
    } else if (name === 'logoFile' && files && files[0]) {
      setForm((prev) => ({
        ...prev,
        logoFile: files[0],
        logo: URL.createObjectURL(files[0]),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = [...prev.locations];
      updated[idx] = { ...updated[idx], [name]: value };
      return { ...prev, locations: updated };
    });
  };

  const addLocation = () => {
    setForm((prev) => ({
      ...prev,
      locations: [...prev.locations, { locationName: '', latitude: '', longitude: '' }],
    }));
  };

  const removeLocation = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== idx),
    }));
  };

  const handleRemoveImage = (url: string) => {
    setImagesToRemove((prev) => [...prev, url]);
    setForm((prev) => ({
      ...prev,
      institutionImages: prev.institutionImages.filter((img) => img !== url),
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!validateName(form.name)) newErrors['name'] = 'Please enter a valid institution name.';
    if (!validateEmail(form.email))
      newErrors['email'] = 'Please enter a valid email (e.g., example@example.org).';
    if (!validatePhone(form.phone))
      newErrors['phone'] = 'Phone must include a country code and be at least 9 digits.';
    if (!validateHeadName(form.headName))
      newErrors['headName'] =
        'Please use a valid head name (e.g., Nyoka Nawani Deng, at least 6 chars).';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let error = '';
    if (name === 'email' && value && !validateEmail(value)) {
      error = 'Please enter a valid email (e.g., example@example.org).';
    }
    if (name === 'phone' && value && !validatePhone(value)) {
      error = 'Phone must include a country code and be at least 9 digits.';
    }
    if (name === 'name' && value && !validateName(value)) {
      error = 'Please enter a valid institution name.';
    }
    if (name === 'headName' && value && !validateHeadName(value)) {
      error = 'Please use a valid head name (at least 6 chars, e.g. Nyoka Nawani Deng).';
    }
    if (error) setErrors((prev) => ({ ...prev, [name]: error }));
    else setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    if (!session?.user?.id) {
      alert('You must be logged in.');
      setLoading(false);
      return;
    }

    if (mode === 'create' && (!form.files || form.files.length === 0)) {
      setErrors((prev) => ({
        ...prev,
        files: 'Please upload at least one image.',
      }));
      setLoading(false);
      return;
    }

    if (mode === 'create' && !form.logoFile) {
      setErrors((prev) => ({
        ...prev,
        logoFile: 'Please upload a logo image.',
      }));
      setLoading(false);
      return;
    }

    const institutionFormData = new FormData();
    institutionFormData.append('name', form.name.trim());
    institutionFormData.append('email', form.email.trim());
    institutionFormData.append('phone', form.phone.trim());
    institutionFormData.append('headName', form.headName.trim());
    institutionFormData.append('institutionType', form.institutionType);

    if (form.logoFile) {
      institutionFormData.append('logoFile', form.logoFile);
    }

    if (mode === 'edit') {
      institutionFormData.append('institutionImages', JSON.stringify(form.institutionImages));
      institutionFormData.append('imagesToRemove', JSON.stringify(imagesToRemove));
    }

    if (form.files && form.files.length > 0) {
      Array.from(form.files).forEach((file) => {
        institutionFormData.append('files', file);
      });
    }

    let institutionId: string | null = null;
    try {
      let res;
      if (mode === 'edit' && initialData?.id) {
        res = await fetch(`/api/institutions/${initialData.id}`, {
          method: 'PATCH',
          body: institutionFormData,
        });
      } else {
        institutionFormData.append(
          'locations',
          JSON.stringify(
            form.locations
              .filter((loc) => !loc.id)
              .map((loc) => ({
                locationName: loc.locationName,
                latitude: loc.latitude ? parseFloat(loc.latitude) : null,
                longitude: loc.longitude ? parseFloat(loc.longitude) : null,
              }))
          )
        );
        res = await fetch('/api/institutions', {
          method: 'POST',
          body: institutionFormData,
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || `Failed to ${mode} institution`;
        throw new Error(errorMessage);
      }

      const result = await res.json();
      institutionId = result.id || result.institution?.id;
    } catch (err) {
      alert(
        `There was an error ${
          mode === 'edit' ? 'updating' : 'creating'
        } the institution. Please try again.`
      );
      setLoading(false);
      return;
    }

    if (mode === 'edit' && institutionId) {
      try {
        for (const loc of form.locations) {
          if ((!loc.id || loc.id === '') && (loc.locationName || loc.latitude || loc.longitude)) {
            await fetch('/api/locations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                locationName: loc.locationName,
                latitude: loc.latitude ? parseFloat(loc.latitude) : null,
                longitude: loc.longitude ? parseFloat(loc.longitude) : null,
                institutionId,
              }),
            });
          }
        }
      } catch (err) {
        alert('Failed to update locations for the institution.');
        setLoading(false);
        return;
      }
    }

    if (onSuccess) onSuccess();
    router.refresh();
    router.push('/admin/dashboard');
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (
      !window.confirm(
        'Are you sure you want to delete this institution? This action cannot be undone.'
      )
    )
      return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/institutions/${initialData.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || 'Failed to delete institution';
        throw new Error(errorMessage);
      }

      if (onSuccess) onSuccess();
      router.refresh();
      router.push('/admin/dashboard');
    } catch (err) {
      alert('There was an error deleting the institution. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto mt-4 space-y-6 p-6 bg-background rounded-xl shadow"
      encType="multipart/form-data"
      autoComplete="off"
    >
      <div className="text-2xl font-bold mb-4 text-center">
        {mode === 'edit' ? 'Edit Institution' : 'Create New Institution'}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">{INSTITUTION_LABEL}</Label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          placeholder="GoGirls ICT Initiative, etc"
        />
        {errors.name && <div className="text-red-600 text-xs">{errors.name}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{EMAIL_LABEL}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          placeholder="example@example.org, example@gmail.com, etc"
        />
        {errors.email && <div className="text-red-600 text-xs">{errors.email}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{PHONE_LABEL}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          minLength={9}
          placeholder="+211700000000, 00256780000000, etc"
        />
        {errors.phone && <div className="text-red-600 text-xs">{errors.phone}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="logoFile">
          {mode === 'edit' ? 'Logo (optional, will replace current)' : 'Logo (required)'}
        </Label>
        <Input
          id="logoFile"
          name="logoFile"
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleChange}
          required={mode === 'create'}
        />
        {errors.logoFile && <div className="text-red-600 text-xs">{errors.logoFile}</div>}
        {form.logo && (
          <img
            src={form.logo}
            alt="Logo Preview"
            className="w-24 h-24 object-cover rounded border mt-2"
          />
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="headName">{HEAD_LABEL}</Label>
        <Input
          id="headName"
          name="headName"
          value={form.headName}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          placeholder="Nyoka Nawani Deng, etc"
        />
        {errors.headName && <div className="text-red-600 text-xs">{errors.headName}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="institutionType">Institution Type</Label>
        <select
          id="institutionType"
          name="institutionType"
          value={form.institutionType}
          onChange={handleChange}
          className="w-full border border-input rounded-md p-2 text-sm bg-background text-foreground"
        >
          {institutionTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>
      {mode === 'edit' && form.institutionImages && form.institutionImages.length > 0 && (
        <div className="space-y-2">
          <Label>Current Images</Label>
          <div className="flex flex-wrap gap-4">
            {form.institutionImages.map((img) => (
              <div key={img} className="relative">
                <img
                  src={img}
                  alt="Institution"
                  className="w-24 h-24 object-cover rounded border"
                />
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
      <div className="space-y-2">
        <Label htmlFor="files">
          {mode === 'edit'
            ? 'Image Upload (optional, will replace/add to current images)'
            : 'Image Upload (required)'}
        </Label>
        <Input
          id="files"
          name="files"
          type="file"
          accept="image/png,image/jpeg"
          multiple
          onChange={handleChange}
          required={mode === 'create'}
        />
        {errors.files && <div className="text-red-600 text-xs">{errors.files}</div>}
      </div>
      <div className="space-y-2">
        <Label>Locations</Label>
        {form.locations.map((loc, idx) => (
          <div key={idx} className="flex gap-2 items-end mb-2">
            <div className="flex-1">
              <Input
                placeholder="Location Name"
                name="locationName"
                value={loc.locationName}
                onChange={(e) => handleLocationChange(idx, e)}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Latitude"
                name="latitude"
                type="number"
                value={loc.latitude}
                onChange={(e) => handleLocationChange(idx, e)}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Longitude"
                name="longitude"
                type="number"
                value={loc.longitude}
                onChange={(e) => handleLocationChange(idx, e)}
              />
            </div>
            {form.locations.length > 1 && (
              <Button type="button" className="bg-red-500" onClick={() => removeLocation(idx)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={addLocation} className="bg-[#9f004d]">
          Add Location
        </Button>
      </div>
      <div className="flex gap-4 w-full">
        <Button type="submit" disabled={loading} className="w-1/2 bg-[#9f004d]">
          {loading
            ? mode === 'edit'
              ? 'Updating...'
              : 'Creating...'
            : mode === 'edit'
            ? 'Update Institution'
            : 'Create Institution'}
        </Button>
        <Button type="button" onClick={onCancel} disabled={loading} className="w-1/2 bg-black">
          Cancel
        </Button>
      </div>
      {mode === 'edit' && (
        <Button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="w-full mt-4 bg-red-700"
        >
          {deleting ? 'Deleting...' : 'Delete Institution'}
        </Button>
      )}
    </form>
  );
}
// This form allows admins to create or edit institution records, including uploading images and managing locations.
// It validates inputs, handles file uploads, and supports both creation and editing modes.