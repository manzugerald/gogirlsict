import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import CreateProjectForm from "./createProjectForm";

export default async function ProtectedCreateProjectPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // Not logged in, redirect to login page
    redirect(`/admin?callbackUrl=${encodeURIComponent('/admin/new-project')}`);
  }

  return <CreateProjectForm />;
}