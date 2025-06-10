"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Project } from "@/lib/generated/prisma";
import Link from "next/link";

export const projectColumns: ColumnDef<Project>[] = [
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
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <div className="whitespace-normal break-words max-w-xs">
        {row.getValue("slug")}
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
    accessorKey: "projectStatus",
    header: "Status",
  },
  {
    accessorKey: "publishStatus",
    header: "Publish",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const projectId = row.original.id;
      return (
        <Link
          href={`/admin/projects/${projectId}/edit`}
          className="text-blue-600 hover:underline"
        >
          Edit
        </Link>
      );
    },
  },
];
