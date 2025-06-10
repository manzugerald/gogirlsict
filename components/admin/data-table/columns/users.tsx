// users.ts
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/generated/prisma";
import Link from "next/link";

export const userColumns: ColumnDef<User>[] = [
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
    cell: ({ row }) => {
      const userId = row.original.id;
      return (
        <Link
          href={`/admin/users/${userId}/edit`}
          className="text-blue-600 hover:underline"
        >
          Edit
        </Link>
      );
    },
  },
];
