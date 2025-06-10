"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Report } from "@/lib/generated/prisma";
import Link from "next/link";

export const reportColumns: ColumnDef<Report>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="whitespace-normal break-words max-w-xs">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => new Date(row.getValue("updatedAt")).toLocaleDateString(),
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
  },
  {
    accessorKey: "publishStatus",
    header: "Publish",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const reportId = row.original.id;
      return (
        <Link
          href={`/admin/reports/${reportId}/edit`}
          className="text-blue-600 hover:underline"
        >
          Edit
        </Link>
      );
    },
  },
];
