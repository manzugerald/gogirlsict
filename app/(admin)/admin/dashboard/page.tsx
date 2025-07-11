'use client';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo, useRef, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/app/(admin)/admin/dashboard/data-table/data-table/data-table';
import { projectColumns } from '@/app/(admin)/admin/dashboard/data-table/columns/projects';
import { columns } from '@/app/(admin)/admin/dashboard/data-table/columns';
import dynamic from 'next/dynamic';
import { reportColumns } from '@/app/(admin)/admin/dashboard/data-table/columns/reports';
import { userColumns } from '@/app/(admin)/admin/dashboard/data-table/columns/users';
import { eventColumns } from '@/app/(admin)/admin/dashboard/data-table/columns/events';
import { institutionColumns } from './data-table/columns/institutions';
import { beneficiaryColumns } from './data-table/columns/beneficiaries'; // <-- ADD THIS IMPORT
import DashboardChart from './chart/dashboardChart';
import ChartSection from './chartSection';

const sections = [
  'events',
  'projects',
  'reports',
  'institutions',
  'beneficiaries', // <-- ADD THIS
  'charts',
  'Home Page',
  'admin',
] as const;
type Section = (typeof sections)[number];
const validKeys = [
  'projects',
  'reports',
  'admin',
  'events',
  'institutions',
  'beneficiaries',
] as const;

const rowsPerPageOptions = [5, 10, 25, 50];

const createFormMap: Record<string, any> = {
  projects: dynamic(() => import('./createProjectForm'), { ssr: false }),
  reports: dynamic(() => import('./createReportForm'), { ssr: false }),
  admin: dynamic(() => import('./createUserForm'), { ssr: false }),
  events: dynamic(() => import('./createEventForm'), { ssr: false }),
  institutions: dynamic(() => import('./createInstitutionForm'), { ssr: false }),
  beneficiaries: dynamic(() => import('./createBeneficiaryForm'), { ssr: false }), 
  charts: dynamic(() => import('./chartSection'), { ssr: false }),
};

export default function AdminDashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState('');
  const sectionRef = useRef(activeSection);

  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin');
    }
  }, [status, router]);

  useEffect(() => {
    const searchType = searchParams.get('type') as Section | null;
    const defalultSection: Section = 'charts';
    const sectionToLoad =
      searchType && sections.includes(searchType) ? searchType : defalultSection;
    handleCardClick(sectionToLoad);
    // eslint-disable-next-line
  }, []);

  function handleEdit(record: any) {
    setEditRecord(record);
    setShowCreateForm(false);
  }

  async function handleDelete(
    type: 'projects' | 'reports' | 'users' | 'events' | 'institutions' | 'beneficiaries', // <-- ADD beneficiaries
    id: string | number
  ) {
    const typeLabel = type.slice(0, -1); // remove trailing 's' → for confirmation text
    if (!confirm(`Are you sure you want to delete this ${typeLabel}?`)) return;

    try {
      const res = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });

      if (res.ok) {
        setData((prev) => prev.filter((item) => item.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || `Failed to delete ${typeLabel}. Please try again`);
      }
    } catch (error) {
      console.error(`Error deleting ${typeLabel}:`, error);
      alert(`An error occurred while deleting the ${typeLabel}.`);
    }
  }

  //Table
  const sectionFeatures: Record<
    string,
    {
      searchable?: boolean;
      sortable?: boolean;
      addNew?: boolean;
      apiRoute?: string;
      columns?: any;
      getColumns?: (() => any) | null;
      isChart?: boolean;
    }
  > = {
    projects: {
      searchable: true,
      sortable: true,
      addNew: true,
      apiRoute: '/api/projects',
      columns: projectColumns,
      getColumns: () => [
        {
          id: 'number',
          header: 'No.',
          cell: ({ row }: any) => (page - 1) * rowsPerPage + row.index + 1,
          size: 50,
        },
        ...projectColumns({ onEdit: handleEdit, onDelete: (id) => handleDelete('projects', id) }),
      ],
    },
    reports: {
      searchable: true,
      sortable: true,
      addNew: true,
      apiRoute: '/api/reports',
      columns: columns.reports,
      getColumns: () => [
        {
          id: 'number',
          header: 'No.',
          cell: ({ row }: any) => (page - 1) * rowsPerPage + row.index + 1,
          size: 50,
        },
        ...reportColumns({ onEdit: handleEdit, onDelete: (id) => handleDelete('reports', id) }),
      ],
    },
    admin: {
      searchable: true,
      sortable: true,
      addNew: true,
      apiRoute: '/api/users',
      columns: columns.admin,
      getColumns: () => [
        {
          id: 'number',
          header: 'No.',
          cell: ({ row }: any) => (page - 1) * rowsPerPage + row.index + 1,
          size: 50,
        },
        ...userColumns({ onEdit: handleEdit, onDelete: (id) => handleDelete('users', id) }),
      ],
    },
    events: {
      searchable: true,
      sortable: true,
      addNew: true,
      apiRoute: '/api/events',
      columns: columns.events,
      getColumns: () => [
        {
          id: 'number',
          header: 'No.',
          cell: ({ row }: any) => (page - 1) * rowsPerPage + row.index + 1,
          size: 50,
        },
        ...eventColumns({
          onEdit: handleEdit,
          onDelete: (id) => handleDelete('events', id),
        }),
      ],
    },
    institutions: {
      searchable: true,
      sortable: true,
      addNew: true,
      apiRoute: '/api/institutions',
      columns: institutionColumns,
      getColumns: () => [
        {
          id: 'number',
          header: 'No.',
          cell: ({ row }: any) => (page - 1) * rowsPerPage + row.index + 1,
          size: 50,
        },
        ...institutionColumns({
          onEdit: handleEdit,
          onDelete: (id) => handleDelete('institutions', id),
        }),
      ],
    },
    beneficiaries: {
      // <-- ADD THIS SECTION
      searchable: true,
      sortable: true,
      addNew: true,
      apiRoute: '/api/beneficiaries',
      columns: beneficiaryColumns,
      getColumns: () => [
        {
          id: 'number',
          header: 'No.',
          cell: ({ row }: any) => (page - 1) * rowsPerPage + row.index + 1,
          size: 50,
        },
        ...beneficiaryColumns({
          onEdit: handleEdit,
          onDelete: (id) => handleDelete('beneficiaries', id),
        }),
      ],
    },
    charts: {
      isChart: true,
    },
    'Home Page': {
      searchable: false,
      sortable: false,
      addNew: false,
      apiRoute: '/api/homepage',
      columns: columns.admin,
      getColumns: null,
    },
  };

  // ---- EVENT HANDLERS ----
  async function handleCardClick(section: Section) {
    // Update URL with ?type=section
    const newUrl = `${pathname}?type=${section}`;
    router.replace(newUrl);
    // set active section and reset related states
    setActiveSection(section);
    setEditRecord(null);
    setShowCreateForm(false);
    setPage(1);
    sectionRef.current = section;
    // fetch data dynamically
    const feat = sectionFeatures[section];
    if (feat?.apiRoute) {
      const res = await fetch(feat.apiRoute);
      const dat = await res.json();
      setData(dat); // <-- sets all user data for the admin section
    } else {
      setData([]);
    }
  }

  // ---- TABLE LOGIC ----
  const sortedData = useMemo(() => {
    if (!activeSection || !sectionFeatures[activeSection]?.sortable) return data;
    let sorted = [...data];
    sorted.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortBy, sortOrder, activeSection]);

  const filteredData = useMemo(() => {
    if (!activeSection || !sectionFeatures[activeSection]?.searchable || !search.trim())
      return sortedData;
    const lower = search.toLowerCase();
    return sortedData.filter((item) =>
      Object.keys(item).some(
        (key) => typeof item[key] === 'string' && item[key].toLowerCase().includes(lower)
      )
    );
  }, [sortedData, search, activeSection]);

  const pageCount = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(
    () => filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [filteredData, page, rowsPerPage]
  );

  // ---- DYNAMIC FORM COMPONENT ----
  const getCreateFormComponent = () => {
    if (!activeSection || !createFormMap[activeSection]) return null;
    const FormComponent = createFormMap[activeSection];
    return (
      <Suspense fallback={<div>Loading form...</div>}>
        <FormComponent
          mode={editRecord ? 'edit' : 'create'}
          userId={editRecord?.id}
          initialData={editRecord || undefined}
          onSuccess={() => {
            setShowCreateForm(false);
            setEditRecord(null);
            handleCardClick(activeSection);
          }}
          onCancel={() => {
            setShowCreateForm(false);
            setEditRecord(null);
          }}
        />
      </Suspense>
    );
  };

  // ---- RENDER ----
  if (status === 'loading') {
    return <div>Checking session ...</div>;
  }

  return (
    <div className="p-6">
      <div className="grid md:grid-cols-8 gap-4">
        {sections.map((section) => (
          <Card
            key={section}
            onClick={() => handleCardClick(section)}
            className={`
              cursor-pointer 
              p-4
              h-12
              flex items-center justify-center text-center
              rounded-sm  
              transition 
              ${
                activeSection === section
                  ? 'bg-[#9f004d] text-white shadow-2xl border-2 border-[#9f004d] scale-105'
                  : 'text-gray-400 opacity-70 grayscale hover:opacity-100 hover:grayscale-0'
              }`}
          >
            {section.toUpperCase()}
          </Card>
        ))}
      </div>

      {activeSection && (
        <>
          {/* Controls Row: Show only if NOT adding or editing */}
          {!showCreateForm && !editRecord && !sectionFeatures[activeSection]?.isChart && (
            <div className="flex items-center justify-between mt-8">
              <div className="flex gap-4 items-center">
                {sectionFeatures[activeSection]?.searchable && (
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search..."
                    className="rounded border px-2 py-1"
                    style={{ minWidth: 120 }}
                  />
                )}
                {sectionFeatures[activeSection]?.sortable && (
                  <div>
                    <label className="mr-2 font-semibold">Sort by:</label>
                    <select
                      className="rounded border px-2 py-1"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="createdAt">Date</option>
                      <option value="title">Title</option>
                    </select>
                    <button
                      className="ml-2 px-2 rounded border"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                )}
                <div>
                  <label className="mr-2 font-semibold">Rows per page:</label>
                  <select
                    className="rounded border px-2 py-1"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    {rowsPerPageOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {sectionFeatures[activeSection]?.addNew && (
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    setEditRecord(null);
                  }}
                  className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Add New{' '}
                  {activeSection
                    .replace(/^\w/, (c) => c.toUpperCase())
                    .replace(/_/g, ' ')
                    .slice(0, -1)}
                </button>
              )}
            </div>
          )}

          {/* Create/Edit Form */}
          {(showCreateForm || editRecord) && (
            <div className="mt-10">{getCreateFormComponent()}</div>
          )}

          {/* Data Table  or charts */}
          {!showCreateForm && !editRecord && (
            <div className="mt-6">
              {sectionFeatures[activeSection]?.isChart ? (
                <ChartSection />
              ) : (
                <DataTable
                  columns={
                    sectionFeatures[activeSection]?.getColumns
                      ? sectionFeatures[activeSection]?.getColumns!()
                      : sectionFeatures[activeSection]?.columns
                  }
                  data={paginatedData}
                />
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {pageCount > 1 && !showCreateForm && !editRecord && (
            <div className="flex gap-2 mt-4 justify-end items-center">
              <button
                className="px-2 py-1 rounded border"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>
              <span>
                Page {page} of {pageCount}
              </span>
              <button
                className="px-2 py-1 rounded border"
                disabled={page === pageCount}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
// This file is the main dashboard for the admin section, allowing management of projects, reports, users, events, institutions, and beneficiaries.
// It includes dynamic forms for creating/editing records, a data table for displaying records, and pagination controls.
// The dashboard also supports searching, sorting, and filtering of records.
