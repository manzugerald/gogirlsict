'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Institution } from '@/lib/generated/prisma';

// Types for Institution and Location with nested relations
export type Location = {
  id: string;
  locationName?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type InstitutionWithRelations = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  logo?: string | null;
  institutionImages: string[];
  headName?: string | null;
  institutionType: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { firstName: string; lastName: string } | null;
  locations: Location[];
};

export function institutionColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (institution: InstitutionWithRelations) => void;
  onDelete: (id: string) => void;
}): ColumnDef<InstitutionWithRelations>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="whitespace-normal break-words max-w-xs">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'institutionType',
      header: 'Type',
      cell: ({ row }) => (
        <span className="capitalize">
          {String(row.getValue('institutionType')).replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'headName',
      header: 'Head Name',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated At',
      cell: ({ row }) => new Date(row.getValue('updatedAt')).toLocaleDateString(),
    },
    {
      id: 'createdBy',
      header: 'Created By',
      cell: ({ row }) => {
        const createdBy = row.original.createdBy;
        if (!createdBy) return '--';
        return `${createdBy.firstName} ${createdBy.lastName}`;
      },
    },
    {
      id: 'locations',
      header: 'Locations',
      cell: ({ row }) => (
        <ul className="list-disc pl-4">
          {row.original.locations && row.original.locations.length > 0 ? (
            row.original.locations.map((loc) => (
              <li key={loc.id}>
                <span className="font-medium">{loc.locationName || 'Unnamed'}</span>
                {loc.latitude !== undefined && loc.latitude !== null && (
                  <span>
                    {' '}
                    - <span className="text-xs">Lat:</span> {loc.latitude}
                  </span>
                )}
                {loc.longitude !== undefined && loc.longitude !== null && (
                  <span>
                    {' '}
                    <span className="text-xs">Lng:</span> {loc.longitude}
                  </span>
                )}
              </li>
            ))
          ) : (
            <li className="italic text-muted-foreground">No locations</li>
          )}
        </ul>
      ),
    },
    {
      id: 'images',
      header: 'Images',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          {row.original.institutionImages && row.original.institutionImages.length > 0 ? (
            row.original.institutionImages.map((img, idx) => (
              <img
                key={img + idx}
                src={img}
                alt="Institution"
                className="w-12 h-12 object-cover rounded border"
              />
            ))
          ) : (
            <span className="italic text-muted-foreground">No images</span>
          )}
        </div>
      ),
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
