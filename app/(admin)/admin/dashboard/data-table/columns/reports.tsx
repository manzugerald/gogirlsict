"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Report } from "@/lib/generated/prisma";
import { Button } from '@/components/ui/button';

type ReportWithUser = Report & {
  createdBy: {
    firstName: string;
    lastName: string;
  };
};

export function reportColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (report: ReportWithUser) => void;
  onDelete: (id: number) => void;
}): ColumnDef<ReportWithUser>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="whitespace-normal break-words max-w-xs">{row.getValue('title')}</div>
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
      id: 'createdBy',
      header: 'Created By',
      cell: ({ row }) => {
        const createdBy = row.original.createdBy;
        if (!createdBy) return '--';
        return `${createdBy.firstName} ${createdBy.lastName}`;
      },
    },
    {
      accessorKey: 'publishStatus',
      header: 'Publish',
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