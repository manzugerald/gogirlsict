'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const publishOptions = ['draft', 'published'] as const;
type PublishStatus = (typeof publishOptions)[number];
const genderOptions = ['male', 'female'] as const;
type GenderType = (typeof genderOptions)[number];
type Mode = 'create' | 'edit';

// InstitutionType enum (as per your schema)
const institutionTypeOptions = [
  'education',
  'faith_based_organization',
  'local_community',
  'ngo',
  'government',
  'other',
] as const;
type InstitutionType = (typeof institutionTypeOptions)[number];

interface BeneficiaryData {
  id?: string;
  firstName: string;
  lastName: string;
  image?: string;
  images?: string[];
  gender: GenderType;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  beneficiaryMessageTitle: any; // JSON
  beneficiaryMessageImages?: string[];
  beneficiaryMessageStatus: PublishStatus;
  institutionId?: string;
}

interface InstitutionData {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  headName?: string;
  institutionType: InstitutionType;
  logoFile?: File | null;
}

export default function CreateBeneficiaryForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: {
  mode: Mode;
  initialData?: BeneficiaryData;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();

  // Fetch institutions on mount
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);

  const [form, setForm] = useState<BeneficiaryData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    image: initialData?.image || undefined,
    images: initialData?.images || [],
    gender: initialData?.gender || 'male',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    dateOfBirth: initialData?.dateOfBirth
      ? new Date(initialData.dateOfBirth).toISOString().split('T')[0]
      : '',
    beneficiaryMessageTitle: initialData?.beneficiaryMessageTitle || '',
    beneficiaryMessageImages: initialData?.beneficiaryMessageImages || [],
    beneficiaryMessageStatus: initialData?.beneficiaryMessageStatus || 'draft',
    institutionId: initialData?.institutionId || '',
  });

  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [messageImageFiles, setMessageImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingMessageImages, setExistingMessageImages] = useState<string[]>(
    initialData?.beneficiaryMessageImages || []
  );

  // Institution create
  const [showInstitutionForm, setShowInstitutionForm] = useState(false);
  const [newInstitution, setNewInstitution] = useState<InstitutionData>({
    name: '',
    email: '',
    phone: '',
    headName: '',
    institutionType: 'education',
    logoFile: null,
  });
  const [creatingInstitution, setCreatingInstitution] = useState(false);
  const [institutionError, setInstitutionError] = useState<string | null>(null);

  useEffect(() => {
    setInstitutionsLoading(true);
    fetch('/api/institutions')
      .then((res) => res.json())
      .then((data) => {
        setInstitutions(data.map((i: any) => ({ id: i.id, name: i.name })));
        setInstitutionsLoading(false);
      })
      .catch(() => setInstitutionsLoading(false));
  }, []);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        ...form,
        ...initialData,
        dateOfBirth: initialData.dateOfBirth
          ? new Date(initialData.dateOfBirth).toISOString().split('T')[0]
          : '',
      });
      setExistingImages(initialData.images || []);
      setExistingMessageImages(initialData.beneficiaryMessageImages || []);
    }
    // eslint-disable-next-line
  }, [mode, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleMessageImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMessageImageFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveExistingImage = (path: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== path));
  };

  const handleRemoveExistingMessageImage = (path: string) => {
    setExistingMessageImages((prev) => prev.filter((img) => img !== path));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      dateOfBirth: e.target.value,
    }));
  };

  const handleInstitutionField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewInstitution((prev) => ({ ...prev, [name]: value }));
  };

  const handleInstitutionLogo = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewInstitution((prev) => ({
        ...prev,
        logoFile: e.target.files![0],
      }));
    }
  };

  const validateInstitutionForm = () => {
    if (!newInstitution.name || newInstitution.name.length < 2) {
      setInstitutionError('Institution name is required.');
      return false;
    }
    if (!newInstitution.logoFile) {
      setInstitutionError('Logo file is required.');
      return false;
    }
    if (!newInstitution.institutionType) {
      setInstitutionError('Institution type is required.');
      return false;
    }
    setInstitutionError(null);
    return true;
  };

  const handleCreateInstitution = async () => {
    if (!validateInstitutionForm()) return;
    setCreatingInstitution(true);
    try {
      const formData = new FormData();
      formData.append('name', newInstitution.name.trim());
      if (newInstitution.email) formData.append('email', newInstitution.email.trim());
      if (newInstitution.phone) formData.append('phone', newInstitution.phone.trim());
      if (newInstitution.headName) formData.append('headName', newInstitution.headName.trim());
      formData.append('institutionType', newInstitution.institutionType);
      if (newInstitution.logoFile) {
        formData.append('logoFile', newInstitution.logoFile);
      }

      const res = await fetch('/api/institutions', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to create institution');
      }

      const institution = await res.json();
      setInstitutions((prev) => [...prev, { id: institution.id, name: institution.name }]);
      setShowInstitutionForm(false);
      setForm((prev) => ({
        ...prev,
        institutionId: institution.id,
      }));
      setNewInstitution({
        name: '',
        email: '',
        phone: '',
        headName: '',
        institutionType: 'education',
        logoFile: null,
      });
      setInstitutionError(null);
    } catch (err: any) {
      setInstitutionError(err.message || 'Failed to create institution');
    } finally {
      setCreatingInstitution(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('firstName', form.firstName.trim());
      formData.append('lastName', form.lastName.trim());
      formData.append('gender', form.gender);
      formData.append('dateOfBirth', form.dateOfBirth);
      if (form.email) formData.append('email', form.email.trim());
      if (form.phone) formData.append('phone', form.phone.trim());
      if (form.institutionId) formData.append('institutionId', form.institutionId);
      formData.append('beneficiaryMessageStatus', form.beneficiaryMessageStatus);

      if (form.beneficiaryMessageTitle)
        formData.append(
          'beneficiaryMessageTitle',
          typeof form.beneficiaryMessageTitle === 'string'
            ? form.beneficiaryMessageTitle
            : JSON.stringify(form.beneficiaryMessageTitle)
        );

      if (existingImages.length > 0) {
        formData.append('images', JSON.stringify(existingImages));
      }
      if (existingMessageImages.length > 0) {
        formData.append('beneficiaryMessageImages', JSON.stringify(existingMessageImages));
      }

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
      messageImageFiles.forEach((file) => {
        formData.append('beneficiaryMessageImages', file);
      });

      let res;
      if (mode === 'edit' && initialData?.id) {
        res = await fetch(`/api/beneficiaries/${initialData.id}`, {
          method: 'PATCH',
          body: formData,
        });
      } else {
        res = await fetch('/api/beneficiaries', {
          method: 'POST',
          body: formData,
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage =
          errorData?.error ||
          (mode === 'edit' ? 'Failed to update beneficiary' : 'Failed to create beneficiary');
        throw new Error(errorMessage);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
        router.push('/admin');
      }
    } catch (err) {
      console.error('Error saving beneficiary:', err);
      alert(
        `There was an error ${
          mode === 'edit' ? 'updating' : 'creating'
        } the beneficiary. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-6 p-6 bg-background rounded-xl shadow"
      encType="multipart/form-data"
      autoComplete="off"
    >
      <h2 className="font-semibold text-xl mb-4">
        {mode === 'edit' ? 'Edit Beneficiary' : 'Create New Beneficiary'}
      </h2>
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <select
          id="gender"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full border border-input rounded-md p-2 text-sm bg-background text-foreground"
          required
        >
          {genderOptions.map((g) => (
            <option key={g} value={g}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          value={form.dateOfBirth}
          onChange={handleDateChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
      </div>

      {/* Existing profile images (for edit) */}
      {mode === 'edit' && existingImages.length > 0 && (
        <div className="space-y-2">
          <Label>Existing Images</Label>
          <div className="flex flex-wrap gap-2">
            {existingImages.map((img, idx) => (
              <div key={img + idx} className="flex items-center gap-1">
                <span className="text-xs">{img}</span>
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
        <Label htmlFor="images">Profile Images (PNG, JPG, JPEG)</Label>
        <Input
          id="images"
          name="images"
          type="file"
          accept=".png,.jpg,.jpeg"
          multiple
          onChange={handleImageChange}
        />
        <div className="text-xs text-muted-foreground">
          {imageFiles.map((file) => file.name).join(', ')}
        </div>
      </div>

      {/* Institution selection */}
      <div className="space-y-2">
        <Label htmlFor="institutionId">Institution</Label>
        <div className="flex gap-2 items-end">
          <select
            id="institutionId"
            name="institutionId"
            value={form.institutionId}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, institutionId: e.target.value }));
              setShowInstitutionForm(false);
            }}
            className="flex-1 border border-input rounded-md p-2 text-sm bg-background text-foreground"
            disabled={institutionsLoading}
            required
          >
            <option value="">None</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            className="ml-2"
            onClick={() => setShowInstitutionForm((val) => !val)}
          >
            Add new institution
          </Button>
        </div>
      </div>

      {/* New Institution Inline Form - not a <form> */}
      {showInstitutionForm && (
        <div className="border rounded-md p-4 mt-2 bg-muted space-y-2">
          <Label htmlFor="institution_name">Institution Name*</Label>
          <Input
            id="institution_name"
            name="name"
            value={newInstitution.name}
            onChange={handleInstitutionField}
            required
          />
          <Label htmlFor="institution_type">Type*</Label>
          <select
            id="institution_type"
            name="institutionType"
            value={newInstitution.institutionType}
            onChange={handleInstitutionField}
            required
            className="w-full border border-input rounded-md p-2 text-sm bg-background text-foreground"
          >
            {institutionTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <Label htmlFor="institution_logo">Logo*</Label>
          <Input
            id="institution_logo"
            name="logoFile"
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleInstitutionLogo}
            required
          />
          <Label htmlFor="institution_email">Email</Label>
          <Input
            id="institution_email"
            name="email"
            value={newInstitution.email}
            onChange={handleInstitutionField}
          />
          <Label htmlFor="institution_phone">Phone</Label>
          <Input
            id="institution_phone"
            name="phone"
            value={newInstitution.phone}
            onChange={handleInstitutionField}
          />
          <Label htmlFor="institution_headName">Head Name</Label>
          <Input
            id="institution_headName"
            name="headName"
            value={newInstitution.headName}
            onChange={handleInstitutionField}
          />
          {institutionError && <div className="text-red-600 text-xs">{institutionError}</div>}
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={creatingInstitution}
              onClick={handleCreateInstitution}
            >
              {creatingInstitution ? 'Adding...' : 'Add Institution'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
              onClick={() => setShowInstitutionForm(false)}
              disabled={creatingInstitution}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="beneficiaryMessageTitle">Message Title (JSON)</Label>
        <Input
          id="beneficiaryMessageTitle"
          name="beneficiaryMessageTitle"
          value={
            typeof form.beneficiaryMessageTitle === 'string'
              ? form.beneficiaryMessageTitle
              : JSON.stringify(form.beneficiaryMessageTitle)
          }
          onChange={handleChange}
        />
        <div className="text-xs text-muted-foreground">
          (Enter as JSON string, e.g. <code>{'{"en": "Welcome"}'}</code>)
        </div>
      </div>

      {mode === 'edit' && existingMessageImages.length > 0 && (
        <div className="space-y-2">
          <Label>Existing Message Images</Label>
          <div className="flex flex-wrap gap-2">
            {existingMessageImages.map((img, idx) => (
              <div key={img + idx} className="flex items-center gap-1">
                <span className="text-xs">{img}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="ml-1 px-2 py-0 text-xs"
                  onClick={() => handleRemoveExistingMessageImage(img)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="beneficiaryMessageImages">Message Images (PNG, JPG, JPEG)</Label>
        <Input
          id="beneficiaryMessageImages"
          name="beneficiaryMessageImages"
          type="file"
          accept=".png,.jpg,.jpeg"
          multiple
          onChange={handleMessageImageChange}
        />
        <div className="text-xs text-muted-foreground">
          {messageImageFiles.map((file) => file.name).join(', ')}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="beneficiaryMessageStatus">Message Publish Status</Label>
        <select
          id="beneficiaryMessageStatus"
          name="beneficiaryMessageStatus"
          value={form.beneficiaryMessageStatus}
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
            ? mode === 'edit'
              ? 'Updating...'
              : 'Creating...'
            : mode === 'edit'
            ? 'Update Beneficiary'
            : 'Create Beneficiary'}
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
