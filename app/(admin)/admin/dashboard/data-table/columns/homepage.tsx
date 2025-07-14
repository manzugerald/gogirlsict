'use client';

import { ColumnDef } from '@tanstack/react-table';
import { HomePage } from '@/lib/generated/prisma';
import { Button } from '@/components/ui/button';

export function homepageColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (homepage: HomePage) => void;
  onDelete: (id: number) => void;
}): ColumnDef<HomePage>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'heroVideo',
      header: 'Hero Video',
      cell: ({ row }) => <div className="truncate max-w-xs">{row.getValue('heroVideo')}</div>,
    },
    {
      accessorKey: 'vision',
      header: 'Vision',
      cell: ({ row }) => (
        <div className="whitespace-normal break-words max-w-xs">{row.getValue('vision')}</div>
      ),
    },
    {
      accessorKey: 'mission',
      header: 'Mission',
      cell: ({ row }) => (
        <div className="whitespace-normal break-words max-w-xs">{row.getValue('mission')}</div>
      ),
    },
    {
      accessorKey: 'focus',
      header: 'Focus',
      cell: ({ row }) => (
        <div className="whitespace-normal break-words max-w-xs">{row.getValue('focus')}</div>
      ),
    },
    {
      accessorKey: 'coreValues',
      header: 'Core Values',
      cell: ({ row }) => (
        <div className="whitespace-normal break-words max-w-xs">{row.getValue('coreValues')}</div>
      ),
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
