'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bar, Pie } from 'react-chartjs-2';
import AnimatedStats from './components/animatedStats';
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
  ChartOptions,
  Plugin,
} from 'chart.js';
import { ChartArea } from 'lucide-react';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

type CountData = {
  projects: number;
  reports: number;
  events: number;
  users: number;
};

const ANIMATION_DURATION = 4.2;

export default function DashboardChart() {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin/dashboard';

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

  const [loop, setLoop] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setLoop((v) => v + 1), (ANIMATION_DURATION + 0.7) * 1000);
    return () => clearInterval(interval);
  }, []);

  //conditionally render labels and values

  const labels = ['Projects', 'Reports', 'Events'].concat(isAdmin ? ['Users'] : []);
  const dataValues = [counts.projects, counts.reports, counts.events].concat(
    isAdmin ? [counts.users] : []
  );
  const backgroundColors = ['#7c3aed', '#f59e42', '#059669'].concat(isAdmin ? ['#2563eb'] : []);
  const total = dataValues.reduce((a, b) => a + b, 0);

  const chartBackgroundPlugin = {
    id: 'chartBackgroundPlugin',
    beforeDraw: (chart: any) => {
      const { ctx, chartArea } = chart;

      // Background
      ctx.save();
      ctx.fillStyle = '#f3f4f6'; // light gray
      ctx.fillRect(
        chartArea.left,
        chartArea.top,
        chartArea.right - chartArea.left,
        chartArea.bottom - chartArea.top
      );

      // Border
      ctx.strokeStyle = '#fff'; // outline color
      ctx.lineWidth = 2;
      ctx.strokeRect(
        chartArea.left,
        chartArea.top,
        chartArea.right - chartArea.left,
        chartArea.bottom - chartArea.top
      );
      ctx.restore();
    },
  };

  const barData = {
    labels,
    datasets: [
      {
        label: 'Count',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: '#fff',
        borderRadius: 6,
        borderWidth: 2,
        // barThickness: 80, // fixed width in pixels
        // maxBarThickness: 40, // upper limit
        // categoryPercentage: 0.8, // % of available width each bar takes
        // barPercentage: 0.9, // % of category width each bar uses
      },
    ],
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // color: 'hsl(var(--foreground))', // respects light/dark theme
          font: {
            weight: 'bold',
            size: 16,
          },
          stepSize: 1,
          precision: 0,
        },
      },
      x: {
        ticks: {
          // color: 'var(--foreground)',

          font: { size: 16, weight: 'bold' },
        },
      },
    },
  };

  const pieData = {
    labels,
    datasets: [
      {
        data: total > 0 ? dataValues : [1, 1, 1, 1],
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
        const percent = ((value / total) * 100).toFixed(1) + '%';
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
    <div className="flex justify-center">
      <Card className="w-full max-w-6xl">
        <CardHeader className="font-bold text-lg text-center">
          {isAdmin
            ? 'Projects, Resources, Events, and Users by numbers'
            : 'Our Projects, Events, and Resources by numbers'}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="flex flex-col gap-12">
              {/* Add AnimatedStats HERE */}
              <div className="m-0">
                <AnimatedStats
                  stats={[
                    { label: 'Projects', value: counts.projects, color: '#7c3aed' },
                    { label: 'Reports', value: counts.reports, color: '#f59e42' },
                    { label: 'Events', value: counts.events, color: '#059669' },
                    { label: 'Users', value: counts.users, color: '#2563eb' },
                  ]}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Bar Chart */}
                <div className="w-full md:w-2/3 h-[300px] mb-4">
                  <div className="font-semibold mb-2">Records Count</div>
                  <Bar data={barData} options={barOptions} plugins={[chartBackgroundPlugin]} />
                </div>

                {/* Pie Chart */}
                <div className="w-full md:w-1/3 flex flex-col gap-6 justify-center items-center">
                  <div className="font-semibold text-center mb-2">Distribution by Type</div>
                  <div className="flex justify-center gap-4 items-center">
                    <div className="w-48 h-48">
                      <Pie
                        key={loop}
                        data={pieData}
                        options={pieOptions}
                        plugins={[piePercentPlugin]}
                      />
                    </div>
                  </div>
                  <PieLegend labels={labels} data={dataValues} colors={backgroundColors} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
