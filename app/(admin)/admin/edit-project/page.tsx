"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CreateProjectForm from "../dashboard/createProjectForm";

export default function EditProjectPage() {
  const searchParams = useSearchParams();
  const [project, setProject] = useState<any>(null);

  
  useEffect(() => {
    // Try to get project from router state (if navigated from dashboard)
    if (window.history.state && window.history.state.usr && window.history.state.usr.project) {
      setProject(window.history.state.usr.project);
    } else {
      // Fallback: fetch project by id from query param
      const id = searchParams.get("id");
      if (id) {
        fetch(`/api/projects/${id}`)
          .then(res => res.json())
          .then(setProject);
      }
    }
  }, [searchParams]);

  if (!project) return <div>Loading...</div>;
  {console.log(`Hey, the id of the project is: ${project.id}`)}

  // TEST: Show the title from the project bundle
  return (
    <div>
      <div className="mb-4 text-green-600 font-bold">
        Prefilled Title: {project.id}
      </div>
      <CreateProjectForm mode="edit" initialData={project} />
    </div>
  );
}