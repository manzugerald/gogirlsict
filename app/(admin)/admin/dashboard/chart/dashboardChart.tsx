'use client';

import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import FilesStatsCharts from './fileStartsCharts';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

type CountData = {
  projects: number;
  reports: number;
  events: number;
  users: number;
};

export default function DashboardChart() {
  const [counts, setCounts] = useState<CountData>({
    projects: 0,
    reports: 0,
    events: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      setLoading(true);
      try {
        const [projectsRes, reportsRes, eventsRes, usersRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/reports'),
          fetch('/api/events'),
          fetch('/api/users'),
        ]);
        const [projects, reports, events, users] = await Promise.all([
          projectsRes.json(),
          reportsRes.json(),
          eventsRes.json(),
          usersRes.json(),
        ]);
        setCounts({
          projects: Array.isArray(projects) ? projects.length : projects.count ?? 0,
          reports: Array.isArray(reports) ? reports.length : reports.count ?? 0,
          events: Array.isArray(events) ? events.length : events.count ?? 0,
          users: Array.isArray(users) ? users.length : users.count ?? 0,
        });
      } catch (err) {
        setCounts({ projects: 0, reports: 0, events: 0, users: 0 });
      }
      setLoading(false);
    }
    fetchCounts();
  }, []);

  const barData = {
    labels: ['Projects', 'Reports', 'Events', 'Users'],
    datasets: [
      {
        label: 'Count',
        data: [counts.projects, counts.reports, counts.events, counts.users],
        backgroundColor: [
          '#7c3aed', // violet
          '#f59e42', // orange
          '#059669', // green
          '#2563eb', // blue
        ],
        borderRadius: 6,
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
      },
    },
  };

  // Pie Chart Data
  const total = counts.projects + counts.reports + counts.events + counts.users;
  const pieData = {
    labels: ['Projects', 'Reports', 'Events', 'Users'],
    datasets: [
      {
        data:
          total > 0 ? [counts.projects, counts.reports, counts.events, counts.users] : [1, 1, 1, 1], // avoid "empty" pie chart if all zero
        backgroundColor: [
          '#7c3aed', // violet
          '#f59e42', // orange
          '#059669', // green
          '#2563eb', // blue
        ],
        borderWidth: 1,
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' as const },
      tooltip: { enabled: true },
      title: { display: false },
    },
  };

  return (
    <div className="flex flex-col gap-8">
      {/* System overview charts */}
      <Card>
        <CardHeader className="font-bold text-lg">Charts Overview</CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
              <div className="w-full md:w-1/2 h-64 flex items-center">
                <Bar data={barData} options={barOptions} />
              </div>
              <div className="w-full md:w-1/2 h-64 flex items-center">
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File stats charts */}
      <FilesStatsCharts />
    </div>
  );
}
