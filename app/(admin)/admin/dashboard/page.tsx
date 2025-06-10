"use client";

import Link from "next/link"; // for navigation
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/admin/data-table/data-table/data-table";
import { columns } from "@/components/admin/data-table/columns"; // centralized columns

const sections = ["Events", "projects", "reports", "system","Home Page", "admin"] as const;
type Section = (typeof sections)[number];

const validKeys = ["projects", "reports", "admin"] as const;
type ValidKey = typeof validKeys[number];

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [data, setData] = useState<any[]>([]);

  const handleCardClick = async (section: Section) => {
    setActiveSection(section);
    switch (section) {
      case "projects": {
        const res = await fetch("/api/projects");
        const projects = await res.json();
        setData(projects);
        break;
      }
      case "reports": {
        const res = await fetch("/api/reports");
        const reports = await res.json();
        setData(reports);
        break;
      }
      case "admin": {
        const res = await fetch("/api/users");
        const users = await res.json();
        setData(users);
        break;
      }
      default:
        setData([]);
    }
  };

  // Determine "Add New" link based on active section
  const getAddNewLink = (section: Section | null) => {
    if (section === "projects") return "/admin/new-project";
    if (section === "reports") return "/admin/new-report";
    if (section === "admin") return "/admin/new-user";
    return null;
  };

  return (
    <div className="p-6">
      <div className="grid md:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Card
            key={section}
            onClick={() => handleCardClick(section)}
            className="cursor-pointer p-6 hover:shadow-xl transition"
          >
            {section.toUpperCase()}
          </Card>
        ))}
      </div>

      {activeSection && validKeys.includes(activeSection as ValidKey) && (
        <>
          {/* Add New Button */}
          {getAddNewLink(activeSection) && (
            <div className="mt-6">
              <Link
                href={getAddNewLink(activeSection)!}
                className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Add New {activeSection === "projects"? "Project"
                  : activeSection === "reports" ? "Report"
                  : activeSection === "admin" ? "User"
                : ""}
              </Link>
            </div>
          )}

          {/* Data Table */}
          <div className="mt-10">
            <DataTable columns={columns[activeSection as ValidKey]} data={data} />
          </div>
        </>
      )}
    </div>
  );
}
