'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Message } from '@/lib/generated/prisma';
import { Button } from '@/components/ui/button';

type MessageWithUser = Message & {
  creator?: {
    firstName: string;
    lastName: string;
  };
  approver?: {
    firstName: string;
    lastName: string;
  };
};

export function messageColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (message: MessageWithUser) => void;
  onDelete: (id: number) => void;
}): ColumnDef<MessageWithUser>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="whitespace-normal break-words max-w-xs">{row.getValue('title')}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'affiliated',
      header: 'Affiliated',
    },
    {
      id: 'message',
      accessorKey: 'message',
      header: 'Message',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        if (!value) return '';
        const words = value.split(/\s+/);
        return words.length > 10 ? words.slice(0, 10).join(' ') + ' ...' : value;
      },
    },
    {
      accessorKey: 'messageStatus',
      header: 'Status',
    },
    {
      id: 'creator',
      header: 'Creator',
      cell: ({ row }) => {
        const creator = row.original.creator;
        if (!creator) return '--';
        return `${creator.firstName} ${creator.lastName}`;
      },
    },
    {
      id: 'approver',
      header: 'Approver',
      cell: ({ row }) => {
        const approver = row.original.approver;
        if (!approver) return '--';
        return `${approver.firstName} ${approver.lastName}`;
      },
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
