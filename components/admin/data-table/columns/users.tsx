"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { User as UserIcon } from "lucide-react";

type UserWithMeta = User;

export function userColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (user: UserWithMeta) => void;
  onDelete: (id: UserWithMeta["id"]) => void; 
}): ColumnDef<UserWithMeta>[] {
  return [
    // --- Image column first ---
    {
      id: "image",
      header: "Image",
      cell: ({ row }) => {
        const src = row.original.image 
        return src ? (
            <img src={src} alt={row.original.username} className="w-8 h-8 rounded-full object-cover border" />
          ) : (
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border">
              <UserIcon className="w-6 h-6 text-muted-foreground" />
            </span>
          );
      },
      size: 48,
    },
    {
      accessorKey: "firstName",
      header: "First Name",
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit(row.original)}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => onDelete(row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];
}