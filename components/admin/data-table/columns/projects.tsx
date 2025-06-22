"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Project } from "@/lib/generated/prisma";
import { Button } from '@/components/ui/button';

type ProjectWithUser = Project & {
  createdBy: {
    firstName: string;
    lastName: string;
  };
};

// Accept props for custom handlers
export function projectColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (project: ProjectWithUser) => void;
  onDelete: (id: number) => void;
}): ColumnDef<ProjectWithUser>[] {
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
      accessorKey: 'projectStatus',
      header: 'Status',
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