'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Pie } from 'react-chartjs-2';
import { CardContent } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
  Plugin,
} from 'chart.js';
import AnimatedPieceBarChart from './components/animatedPieceBarChart';
import { cardHoverClass } from '@/utils/styles/card-hover';
import { useHybridCachedData } from '@/utils/useHybridCachedData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

type CountData = {
  projects: number;
  reports: number;
  events: number;
  users: number;
  institutions: number;
  beneficiaries: number;
};

const ANIMATION_DURATION = 4.2;

// Centralized fetcher that combines all counts in one API call
async function fetchDashboardCounts(): Promise<CountData> {
  const [projectsRes, reportsRes, eventsRes, usersRes, institutionsRes, beneficiariesRes] =
    await Promise.all([
      fetch('/api/projects'),
      fetch('/api/reports'),
      fetch('/api/events'),
      fetch('/api/users'),
      fetch('/api/institutions'),
      fetch('/api/beneficiaries'),
    ]);
  const [projects, reports, events, users, institutions, beneficiaries] = await Promise.all([
    projectsRes.json(),
    reportsRes.json(),
    eventsRes.json(),
    usersRes.json(),
    institutionsRes.json(),
    beneficiariesRes.json(),
  ]);
  return {
    projects: Array.isArray(projects) ? projects.length : projects.count ?? 0,
    reports: Array.isArray(reports) ? reports.length : reports.count ?? 0,
    events: Array.isArray(events) ? events.length : events.count ?? 0,
    users: Array.isArray(users) ? users.length : users.count ?? 0,
    institutions: Array.isArray(institutions) ? institutions.length : institutions.count ?? 0,
    beneficiaries: Array.isArray(beneficiaries) ? beneficiaries.length : beneficiaries.count ?? 0,
  };
}

export default function DashboardChart() {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin/dashboard';

  // Use the hybrid cache with a unique key and a 30min stale time
  const {
    data: counts,
    isLoading,
    refresh,
  } = useHybridCachedData<CountData>('dashboard-counts-v1', fetchDashboardCounts, {
    staleTime: 1000 * 60 * 30,
  });

  const [loop, setLoop] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setLoop((v) => v + 1), (ANIMATION_DURATION + 0.7) * 1000);
    return () => clearInterval(interval);
  }, []);

  const safeCounts: CountData = counts ?? {
    projects: 0,
    reports: 0,
    events: 0,
    users: 0,
    institutions: 0,
    beneficiaries: 0,
  };

  // Updated: Labels, values, and colors to include Institutions and Beneficiaries, and match animatedStats.tsx
  const labels = ['Projects', 'Reports', 'Events', 'Institutions', 'Beneficiaries'].concat(
    isAdmin ? ['Users'] : []
  );
  const dataValues = [
    safeCounts.projects,
    safeCounts.reports,
    safeCounts.events,
    safeCounts.institutions,
    safeCounts.beneficiaries,
    ...(isAdmin ? [safeCounts.users] : []),
  ];
  const backgroundColors = [
    '#7c3aed', // Projects
    '#f59e42', // Reports
    '#059669', // Events
    '#7c482b', // Institutions (brown, matches animatedStats)
    '#eab308', // Beneficiaries (yellow, matches animatedStats)
    ...(isAdmin ? ['#2563eb'] : []), // Users (blue)
  ];
  const total = dataValues.reduce((a, b) => a + b, 0);

  const pieData = {
    labels,
    datasets: [
      {
        data: total > 0 ? dataValues : [1, 1, 1, 1, 1, 1].slice(0, labels.length),
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      title: { display: false },
    },
  };

  const piePercentPlugin: Plugin<'pie'> = {
    id: 'piePercentPlugin',
    afterDraw(chart) {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0];
      const total = dataset.data.reduce((sum: number, val: any) => sum + val, 0);
      dataset.data.forEach((value: any, index: number) => {
        const meta = chart.getDatasetMeta(0);
        const arc = meta.data[index];
        const angle = (arc.startAngle + arc.endAngle) / 2;
        const radius = (arc.outerRadius + arc.innerRadius) / 2;
        const x = arc.x + Math.cos(angle) * radius;
        const y = arc.y + Math.sin(angle) * radius;
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(percent, x, y);
      });
    },
  };

  const PieLegend = ({
    labels,
    data,
    colors,
  }: {
    labels: string[];
    data: number[];
    colors: string[];
  }) => {
    const total = data.reduce((a, b) => a + b, 0);
    return (
      <ul className="text-sm space-y-1">
        {labels.map((label, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="block w-3 h-3 rounded" style={{ backgroundColor: colors[i] }}></span>
            {label} ({data[i]}) - {total ? ((data[i] / total) * 100).toFixed(1) : 0}%
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="w-full">
      <div className="w-full pb-2">
        <CardContent className="flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Charts Row */}
              <div className="flex flex-col md:flex-row gap-6 p-4">
                {/* Animated Piece Bar Chart */}
                <div className={`${cardHoverClass} w-full md:w-7/12`}>
                  <AnimatedPieceBarChart
                    values={dataValues}
                    labels={labels}
                    colors={backgroundColors}
                    animationDuration={1600}
                    loopPause={1000}
                  />
                </div>

                {/* Pie Chart + Legend */}
                <div
                  className={`${cardHoverClass} w-full md:w-5/12 flex items-center justify-center md:flex-row gap-6 p-4`}
                >
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    {/* Pie Chart */}
                    <div className="w-48 h-48">
                      <Pie
                        key={loop}
                        data={pieData}
                        options={pieOptions}
                        plugins={[piePercentPlugin]}
                      />
                    </div>

                    {/* Legend */}
                    <div className="md:w-40">
                      <PieLegend labels={labels} data={dataValues} colors={backgroundColors} />
                    </div>
                  </div>
                </div>
              </div>
              {/* Optional: Add a refresh button */}
              <div className="flex justify-center">
                <button
                  className="px-3 py-1 text-xs rounded bg-violet-700 text-white hover:bg-violet-800"
                  onClick={refresh}
                >
                  Refresh Data
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}
// Note: This component assumes you have the necessary API endpoints set up to fetch the counts.