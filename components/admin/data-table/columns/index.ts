// components/admin/data-table/columns/index.ts
import { ColumnDef } from "@tanstack/react-table";

import { projectColumns } from "./projects";
import { userColumns } from "./users";
import { reportColumns } from "./reports";
import { eventColumns } from "./events";

export const columns = {
  projects: projectColumns,
  reports: reportColumns,
  admin: userColumns,
  events: eventColumns,
};
