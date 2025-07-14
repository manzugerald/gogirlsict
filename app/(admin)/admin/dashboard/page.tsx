'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo, useRef, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/app/(admin)/admin/dashboard/data-table/data-table/data-table';
import { projectColumns } from '@/app/(admin)/admin/dashboard/data-table/columns/projects';
import { reportColumns } from '@/app/(admin)/admin/dashboard/data-table/columns/reports';
import { userColumns } from '@/app/(admin)/admin/dashboard/data-table/columns/users';
import { eventColumns } from '@/app/(admin)/admin/dashboard/data-table/columns/events';
import { institutionColumns } from '@/app/(admin)/admin/dashboard/data-table/columns/institutions';
import { beneficiaryColumns } from '@/app/(admin)/admin/dashboard/data-table/columns/beneficiaries';
import { homepageColumns } from '@/app/(admin)/admin/dashboard/data-table/columns/homepage';
import { messageColumns } from '@/app/(admin)/admin/dashboard/data-table/columns/messages';
import dynamic from 'next/dynamic';
import ChartSection from './chartSection';
import { useHybridCachedData } from '@/utils/useHybridCachedData';
// import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DownloadColumnsModal, { ColumnOption } from './components/downloadColumnsModal';
import { handleDownloadPDF } from './components/handleDownloadPDF';

const CreateHomepageForm = dynamic(() => import('./createHomePageForm'), { ssr: false });
const CreateExecutiveMessageForm = dynamic(() => import('./createExecutiveMessageForm'), {
  ssr: false,
});

const sections = [
  'events',
  'projects',
  'reports',
  'institutions',
  'beneficiaries',
  'charts',
  'Home Page',
  'admin',
] as const;
type Section = (typeof sections)[number];

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
  const [showExecMsgForm, setShowExecMsgForm] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState('');
  const sectionRef = useRef(activeSection);

  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Table refs
  const messagesRef = useRef<HTMLDivElement>(null);
  const homepageRef = useRef<HTMLDivElement>(null);
  const defaultRef = useRef<HTMLDivElement>(null);

  // PDF download modal state
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadColumns, setDownloadColumns] = useState<ColumnOption[]>([]);
  const [pendingDownloadData, setPendingDownloadData] = useState<any[]>([]);

  const {
    data: homepageData,
    isLoading: loadingHomepage,
    refresh: refreshHomepage,
  } = useHybridCachedData(
    'admin-dashboard-homepage-v1',
    async () => {
      const res = await fetch('/api/homepage-content');
      if (!res.ok) throw new Error('Failed to fetch homepage data');
      const d = await res.json();
      return d ? [d] : [];
    },
    { staleTime: 1000 * 60 * 30 }
  );
  const {
    data: messagesData,
    isLoading: loadingMessages,
    refresh: refreshMessages,
  } = useHybridCachedData(
    'admin-dashboard-messages-v1',
    async () => {
      const res = await fetch('/api/executive-messages');
      if (!res.ok) throw new Error('Failed to fetch messages data');
      return await res.json();
    },
    { staleTime: 1000 * 60 * 30 }
  );

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
    if (
      activeSection === 'Home Page' &&
      messagesData &&
      messagesData.some((msg: any) => msg.id === record.id)
    ) {
      setEditRecord(record);
      setShowExecMsgForm(true);
      setShowCreateForm(false);
    } else if (
      activeSection === 'Home Page' &&
      homepageData &&
      homepageData.some((home: any) => home.id === record.id)
    ) {
      setEditRecord(record);
      setShowCreateForm(true);
      setShowExecMsgForm(false);
    } else {
      setEditRecord(record);
      setShowCreateForm(false);
      setShowExecMsgForm(false);
    }
  }

  async function handleDelete(
    type:
      | 'projects'
      | 'reports'
      | 'users'
      | 'events'
      | 'institutions'
      | 'beneficiaries'
      | 'homepage-content'
      | 'executive-messages',
    id: string | number
  ) {
    const typeLabel = type.replace('-', ' ').replace(/s$/, '');
    if (!confirm(`Are you sure you want to delete this ${typeLabel}?`)) return;

    try {
      const res = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });

      if (res.ok) {
        setData((prev) => prev.filter((item) => item.id !== id));
        if (type === 'homepage-content') refreshHomepage();
        if (type === 'executive-messages') refreshMessages();
      } else {
        const data = await res.json();
        alert(data.error || `Failed to delete ${typeLabel}. Please try again`);
      }
    } catch (error) {
      console.error(`Error deleting ${typeLabel}:`, error);
      alert(`An error occurred while deleting the ${typeLabel}.`);
    }
  }

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
      columns: reportColumns,
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
      columns: userColumns,
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
      columns: eventColumns,
      getColumns: () => [
        {
          id: 'number',
          header: 'No.',
          cell: ({ row }: any) => (page - 1) * rowsPerPage + row.index + 1,
          size: 50,
        },
        ...eventColumns({ onEdit: handleEdit, onDelete: (id) => handleDelete('events', id) }),
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
      getColumns: null,
    },
  };

  async function handleCardClick(section: Section) {
    const newUrl = `${pathname}?type=${section}`;
    router.replace(newUrl);
    setActiveSection(section);
    setEditRecord(null);
    setShowCreateForm(false);
    setShowExecMsgForm(false);
    setPage(1);
    sectionRef.current = section;

    const feat = sectionFeatures[section];
    if (section === 'Home Page') {
      // nothing, handled below
    } else if (feat?.apiRoute) {
      const res = await fetch(feat.apiRoute);
      const dat = await res.json();
      setData(dat);
    } else {
      setData([]);
    }
  }

   {
     /* Download Columns Modal */
   }
   <DownloadColumnsModal
     isOpen={downloadModalOpen}
     onClose={() => setDownloadModalOpen(false)}
     columns={downloadColumns}
     onDownload={(selectedColumns) => {
       handleDownloadPDF(pendingDownloadData, selectedColumns);
     }}
   />;
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

  const getCreateFormComponent = () => {
    if (!activeSection) return null;
    if (activeSection === 'Home Page') {
      if (showExecMsgForm)
        return (
          <Suspense fallback={<div>Loading form...</div>}>
            <CreateExecutiveMessageForm
              mode={editRecord ? 'edit' : 'create'}
              initialData={editRecord || undefined}
              onSuccess={() => {
                setShowExecMsgForm(false);
                setEditRecord(null);
                refreshMessages();
              }}
              onCancel={() => {
                setShowExecMsgForm(false);
                setEditRecord(null);
              }}
            />
          </Suspense>
        );
      if (showCreateForm)
        return (
          <Suspense fallback={<div>Loading form...</div>}>
            <CreateHomepageForm
              mode={editRecord ? 'edit' : 'create'}
              initialData={editRecord || undefined}
              onSuccess={() => {
                setShowCreateForm(false);
                setEditRecord(null);
                refreshHomepage();
              }}
              onCancel={() => {
                setShowCreateForm(false);
                setEditRecord(null);
              }}
            />
          </Suspense>
        );
      return null;
    }
    if (!createFormMap[activeSection]) return null;
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

  const TableActions = ({
    data,
    columns,
    tableRef,
  }: {
    data: any[];
    columns: any[];
    tableRef: React.RefObject<HTMLDivElement>;
  }) => {
    const handleExportExcel = () => {
      // Build the rows: header first, then data
      const headers = columns
        .filter((col) => col.header && col.header !== 'Actions' && col.header !== 'Delete')
        .map((col) => (typeof col.header === 'function' ? col.header({}) : col.header));
      const exportableCols = columns.filter(
        (col) => col.header && col.header !== 'Actions' && col.header !== 'Delete'
      );
      const rows = data.map((row, idx) =>
        exportableCols.map((col) => {
          // Serial number
          if (col.id === 'number') return idx + 1;
          // Show value, fallback to empty string
          return row[col.id || col.accessorKey] ?? '';
        })
      );
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, 'table.xlsx');
    };

    return (
      <span className="ml-2 inline-flex gap-2">
        <button className="px-2 py-1 border rounded text-sm" title="Export to Excel" onClick={handleExportExcel}>
          Export to Excel
        </button>
        <button
          className="px-2 py-1 border rounded text-sm"
          title="Download as PDF"
          onClick={() => {
            // Build column options for the modal
            const columnOptions: ColumnOption[] = columns
              .filter((col) => col.header && col.header !== 'Actions' && col.header !== 'Delete')
              .map((col) => ({
                id: col.id || col.accessorKey,
                label: typeof col.header === 'function' ? col.header({}) : col.header,
              }));
            setDownloadColumns(columnOptions);
            setPendingDownloadData(data);
            setDownloadModalOpen(true);
          }}
        >
          Download as PDF
        </button>
      </span>
    );
  };

  if (status === 'loading') {
    return <div>Checking session ...</div>;
  }

  const showExecMsgAddButton =
    activeSection === 'Home Page' && !showCreateForm && !showExecMsgForm && !editRecord;

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
          {/* Controls Row: Show only if NOT adding or editing and not Home Page */}
          {!showCreateForm &&
            !showExecMsgForm &&
            !editRecord &&
            !sectionFeatures[activeSection]?.isChart &&
            activeSection !== 'Home Page' && (
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
                    <TableActions
                      data={paginatedData}
                      columns={
                        sectionFeatures[activeSection]?.getColumns
                          ? sectionFeatures[activeSection]?.getColumns!()
                          : sectionFeatures[activeSection]?.columns
                      }
                      tableRef={defaultRef}
                    />
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
          {(showCreateForm || showExecMsgForm || editRecord) && (
            <div className="mt-10">{getCreateFormComponent()}</div>
          )}

          {/* Data Table or charts */}
          {!showCreateForm && !showExecMsgForm && !editRecord && (
            <div className="mt-6">
              {activeSection === 'Home Page' ? (
                <div className="space-y-10">
                  {/* Executive Messages Table (now first) */}
                  <div>
                    <div className="flex justify-end mb-2">
                      {showExecMsgAddButton && (
                        <button
                          className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                          onClick={() => {
                            setEditRecord(null);
                            setShowExecMsgForm(true);
                            setShowCreateForm(false);
                          }}
                        >
                          Add New Executive Message
                        </button>
                      )}
                    </div>
                    <div ref={messagesRef}>
                      <DataTable
                        columns={[
                          {
                            id: 'number',
                            header: 'No.',
                            cell: ({ row }: any) => row.index + 1,
                            size: 50,
                          },
                          ...messageColumns({
                            onEdit: handleEdit,
                            onDelete: (id) => handleDelete('executive-messages', id),
                          }),
                        ]}
                        data={messagesData || []}
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <TableActions
                        data={messagesData || []}
                        columns={[
                          {
                            id: 'number',
                            header: 'No.',
                            cell: ({ row }: any) => row.index + 1,
                            size: 50,
                          },
                          ...messageColumns({
                            onEdit: handleEdit,
                            onDelete: (id) => handleDelete('executive-messages', id),
                          }),
                        ]}
                        tableRef={messagesRef}
                      />
                    </div>
                  </div>
                  {/* HomePage Table */}
                  <div ref={homepageRef}>
                    <DataTable
                      columns={[
                        {
                          id: 'number',
                          header: 'No.',
                          cell: ({ row }: any) => row.index + 1,
                          size: 50,
                        },
                        ...homepageColumns({
                          onEdit: handleEdit,
                          onDelete: (id) => handleDelete('homepage-content', id),
                        }),
                      ]}
                      data={homepageData || []}
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <TableActions
                      data={homepageData || []}
                      columns={[
                        {
                          id: 'number',
                          header: 'No.',
                          cell: ({ row }: any) => row.index + 1,
                          size: 50,
                        },
                        ...homepageColumns({
                          onEdit: handleEdit,
                          onDelete: (id) => handleDelete('homepage-content', id),
                        }),
                      ]}
                      tableRef={homepageRef}
                    />
                  </div>
                </div>
              ) : sectionFeatures[activeSection]?.isChart ? (
                <ChartSection />
              ) : (
                <div ref={defaultRef}>
                  <DataTable
                    columns={
                      sectionFeatures[activeSection]?.getColumns
                        ? sectionFeatures[activeSection]?.getColumns!()
                        : sectionFeatures[activeSection]?.columns
                    }
                    data={paginatedData}
                  />
                </div>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {pageCount > 1 &&
            !showCreateForm &&
            !showExecMsgForm &&
            !editRecord &&
            activeSection !== 'Home Page' && (
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
      {/* Download Columns Modal */}
      <DownloadColumnsModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        columns={downloadColumns}
        onDownload={(selectedColumns) => {
          handleDownloadPDF(
            pendingDownloadData,
            selectedColumns,
            activeSection ? activeSection.charAt(0).toUpperCase() + activeSection.slice(1) : 'Data'
          );
        }}
      />
    </div>
  );
}
// This code is a Next.js page component for an admin dashboard.
// It allows admins to manage various sections like projects, reports, users, events, institutions,