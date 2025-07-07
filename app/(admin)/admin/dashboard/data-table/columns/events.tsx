"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Event } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";

type EventWithUser = Event & {
    createdBy: {
        firstName: string;
        lastName: string;
    };
};

// Accept props for custom handlers
export function eventColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (event: EventWithUser) => void;
  onDelete: (eventId: number) => void;
}): ColumnDef<EventWithUser>[] {
  return [
    {
      accessorKey: "eventTitle",
      header: "Title",
      cell: ({ row }) => (
        <div className="whitespace-normal break-words max-w-xs">
          {row.getValue("eventTitle")}
        </div>
      ),
    },
    {
      accessorKey: "eventStartDate",
      header: "Start Date",
      cell: ({ row }) =>
        row.getValue("eventStartDate")
          ? new Date(row.getValue("eventStartDate")).toLocaleDateString()
          : "",
    },
    {
      accessorKey: "eventEndDate",
      header: "End Date",
      cell: ({ row }) =>
        row.getValue("eventEndDate")
          ? new Date(row.getValue("eventEndDate")).toLocaleDateString()
          : "",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) =>
        new Date(row.getValue("createdAt")).toLocaleDateString(),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) =>
        new Date(row.getValue("updatedAt")).toLocaleDateString(),
    },
    {
      id: "createdBy",
      header: "Created By",
      cell: ({ row }) => {
        const createdBy = row.original.createdBy;
        if (!createdBy) return "-";
        return `${createdBy.firstName} ${createdBy.lastName}`;
      },
      
    },
    {
      accessorKey: "eventStatus",
      header: "Status",
    },
    {
      accessorKey: "publishStatus",
      header: "Publish",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onEdit(row.original)}
        >
          Edit
        </Button>
      ),
    },
    {
      id: "delete",
      header: "Delete",
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