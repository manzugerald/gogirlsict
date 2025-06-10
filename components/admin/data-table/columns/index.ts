// components/admin/data-table/columns/index.ts
import { ColumnDef } from "@tanstack/react-table";

import { projectColumns } from "./projects";
import { userColumns } from "./users";
import { reportColumns } from "./reports";

export const columns: Record<"projects" | "admin" | "reports", ColumnDef<any, any>[]> = {
  projects: projectColumns,
  reports: reportColumns,
  admin: userColumns,
};
