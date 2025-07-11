'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Beneficiary } from '@/lib/generated/prisma';
import { Button } from '@/components/ui/button';

type BeneficiaryWithUserAndInstitution = Beneficiary & {
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  institution?: {
    id: string;
    name: string;
  };
};

// Accept props for custom handlers
export function beneficiaryColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (beneficiary: BeneficiaryWithUserAndInstitution) => void;
  onDelete: (beneficiaryId: string) => void;
}): ColumnDef<BeneficiaryWithUserAndInstitution>[] {
  return [
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: ({ row }) => (
        <div className="whitespace-normal break-words max-w-xs">{row.getValue('firstName')}</div>
      ),
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      cell: ({ row }) => (
        <div className="whitespace-normal break-words max-w-xs">{row.getValue('lastName')}</div>
      ),
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => {
        const val = row.getValue('gender');
        return val ? (val as string)[0].toUpperCase() + (val as string).slice(1) : '';
      },
    },
    {
      accessorKey: 'dateOfBirth',
      header: 'Date of Birth',
      cell: ({ row }) =>
        row.getValue('dateOfBirth')
          ? new Date(row.getValue('dateOfBirth')).toLocaleDateString()
          : '',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.getValue('email') || '-',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.getValue('phone') || '-',
    },
    {
      accessorKey: 'institution',
      header: 'Institution',
      cell: ({ row }) => {
        const institution = row.original.institution;
        return institution ? institution.name : '-';
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) =>
        row.getValue('createdAt') ? new Date(row.getValue('createdAt')).toLocaleDateString() : '',
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated At',
      cell: ({ row }) =>
        row.getValue('updatedAt') ? new Date(row.getValue('updatedAt')).toLocaleDateString() : '',
    },
    {
      id: 'createdBy',
      header: 'Created By',
      cell: ({ row }) => {
        const createdBy = row.original.createdBy;
        if (!createdBy) return '-';
        return `${createdBy.firstName} ${createdBy.lastName}`;
      },
    },
    {
      accessorKey: 'beneficiaryMessageStatus',
      header: 'Message Status',
      cell: ({ row }) => row.getValue('beneficiaryMessageStatus') || '-',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button type="button" size="sm" variant="outline" onClick={() => onEdit(row.original)}>
          Edit
        </Button>
      ),
    },
    {
      id: 'delete',
      header: 'Delete',
      cell: ({ row }) => (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => onDelete(row.original.id)}
        >
          Delete
        </Button>
      ),
    },
  ];
}
