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
  ChartOptions,
  Plugin,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes + ' B';
}

const pieModuleLabels = ['Projects', 'Events', 'Reports', 'Institutions'];

export default function FilesStatsCharts() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    'Project Images': 0,
    'Project PDFs': 0,
    'Event Images': 0,
    'Event PDFs': 0,
    'Report Images': 0,
    'Report PDFs': 0,
    'Institution Images': 0,
  });
  const [sizes, setSizes] = useState({
    'Project Images': 0,
    'Project PDFs': 0,
    'Event Images': 0,
    'Event PDFs': 0,
    'Report Images': 0,
    'Report PDFs': 0,
    'Institution Images': 0,
  });

  useEffect(() => {
    fetch('/api/file-stats')
      .then((res) => res.json())
      .then((data) => {
        setCounts({
          ...data.counts,
          'Institution Images': data.counts['Institution Images'] ?? 0,
        });
        setSizes({
          ...data.sizes,
          'Institution Images': data.sizes['Institution Images'] ?? 0,
        });
        setLoading(false);
      });
  }, []);

  const barLabels = [
    'Project Images',
    'Project PDFs',
    'Event Images',
    'Event PDFs',
    'Report Images',
    'Report PDFs',
    'Institution Images',
  ];

  const barColors = [
    '#7c3aed', // Projects
    '#a78bfa', // Project PDFs
    '#059669', // Events
    '#34d399', // Event PDFs
    '#f59e42', // Reports
    '#fdba74', // Report PDFs
    '#eab308', // Institutions (yellow)
  ];

  const chartBackgroundPlugin = {
    id: 'chartBackgroundPlugin',
    beforeDraw: (chart: any) => {
      const { ctx, chartArea } = chart;
      ctx.save();
      ctx.fillStyle = '#f3f4f6'; // light gray
      ctx.fillRect(
        chartArea.left,
        chartArea.top,
        chartArea.right - chartArea.left,
        chartArea.bottom - chartArea.top
      );
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

  const pieImagesData = {
    labels: pieModuleLabels,
    datasets: [
      {
        label: 'Images Count',
        data: [
          counts['Project Images'],
          counts['Event Images'],
          counts['Report Images'],
          counts['Institution Images'],
        ],
        backgroundColor: ['#7c3aed', '#059669', '#f59e42', '#eab308'],
      },
    ],
  };

  const piePdfsData = {
    labels: pieModuleLabels.slice(0, 3), // Only Projects, Events, Reports have PDFs
    datasets: [
      {
        label: 'PDFs Count',
        data: [counts['Project PDFs'], counts['Event PDFs'], counts['Report PDFs']],
        backgroundColor: ['#a78bfa', '#34d399', '#fdba74'],
      },
    ],
  };

  const pieImagesSizeData = {
    labels: pieModuleLabels,
    datasets: [
      {
        label: 'Images Size (MB)',
        data: [
          +(sizes['Project Images'] / 1048576).toFixed(2),
          +(sizes['Event Images'] / 1048576).toFixed(2),
          +(sizes['Report Images'] / 1048576).toFixed(2),
          +(sizes['Institution Images'] / 1048576).toFixed(2),
        ],
        backgroundColor: ['#7c3aed', '#059669', '#f59e42', '#eab308'],
      },
    ],
  };

  const piePdfsSizeData = {
    labels: pieModuleLabels.slice(0, 3),
    datasets: [
      {
        label: 'PDFs Size (MB)',
        data: [
          +(sizes['Project PDFs'] / 1048576).toFixed(2),
          +(sizes['Event PDFs'] / 1048576).toFixed(2),
          +(sizes['Report PDFs'] / 1048576).toFixed(2),
        ],
        backgroundColor: ['#a78bfa', '#34d399', '#fdba74'],
      },
    ],
  };

  const barDataCounts = {
    labels: barLabels,
    datasets: [
      {
        label: 'Count',
        data: [
          counts['Project Images'],
          counts['Project PDFs'],
          counts['Event Images'],
          counts['Event PDFs'],
          counts['Report Images'],
          counts['Report PDFs'],
          counts['Institution Images'],
        ],
        backgroundColor: barColors,
      },
    ],
  };

  const barDataSizes = {
    labels: barLabels,
    datasets: [
      {
        label: 'Size (MB)',
        data: [
          +(sizes['Project Images'] / 1048576).toFixed(2),
          +(sizes['Project PDFs'] / 1048576).toFixed(2),
          +(sizes['Event Images'] / 1048576).toFixed(2),
          +(sizes['Event PDFs'] / 1048576).toFixed(2),
          +(sizes['Report Images'] / 1048576).toFixed(2),
          +(sizes['Report PDFs'] / 1048576).toFixed(2),
          +(sizes['Institution Images'] / 1048576).toFixed(2),
        ],
        backgroundColor: barColors,
      },
    ],
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: {
          font: { size: 16, weight: 'bold' },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 16, weight: 'bold' },
          precision: 0,
        },
      },
    },
  };

  const pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  const PieLegend = ({ labels, data, colors }: any) => {
    const total = data.reduce((a: number, b: number) => a + b, 0);
    return (
      <ul className="text-sm">
        {labels.map((label: string, i: number) => (
          <li key={i} className="flex items-center gap-2">
            <span className="block w-4 h-4 rounded" style={{ backgroundColor: colors[i] }}></span>
            {label} ({data[i]}) - {total ? ((data[i] / total) * 100).toFixed(1) : 0}%
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="flex justify-center">
      {/* File Size overview charts */}
      <Card className="w-full max-w-6xl">
        <CardHeader className="font-bold text-lg text-center">File Statistics</CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="flex flex-col gap-12">
              {/* --- Count Charts --- */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Bar chart */}
                <div className="w-full md:w-2/3 h-[350px]">
                  <div className="font-semibold mb-2">Image & PDF Count</div>
                  <Bar
                    data={barDataCounts}
                    options={barOptions}
                    plugins={[chartBackgroundPlugin]}
                  />
                </div>

                {/* Pie charts */}
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                  <div>
                    <div className="font-semibold text-center mb-2">Images File Stats</div>
                    <div className="flex justify-center gap-4 items-center">
                      <div className="w-40 h-40">
                        <Pie
                          data={pieImagesData}
                          options={pieOptions}
                          plugins={[piePercentPlugin]}
                        />
                      </div>
                      <PieLegend
                        labels={pieImagesData.labels}
                        data={pieImagesData.datasets[0].data}
                        colors={pieImagesData.datasets[0].backgroundColor}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-center mb-2">PDF File Stats</div>
                    <div className="flex justify-center gap-4 items-center">
                      <div className="w-40 h-40">
                        <Pie data={piePdfsData} options={pieOptions} plugins={[piePercentPlugin]} />
                      </div>
                      <PieLegend
                        labels={piePdfsData.labels}
                        data={piePdfsData.datasets[0].data}
                        colors={piePdfsData.datasets[0].backgroundColor}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Size Charts --- */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Bar chart */}
                <div className="w-full md:w-2/3 h-[350px]">
                  <div className="font-semibold mb-2 text-center">Image & PDF Sizes (MB)</div>
                  <Bar data={barDataSizes} options={barOptions} plugins={[chartBackgroundPlugin]} />
                  <div className="text-sm mt-2">
                    Total Images Size:{' '}
                    {formatSize(
                      sizes['Project Images'] +
                        sizes['Event Images'] +
                        sizes['Report Images'] +
                        sizes['Institution Images']
                    )}
                    , Total PDFs Size:{' '}
                    {formatSize(sizes['Project PDFs'] + sizes['Event PDFs'] + sizes['Report PDFs'])}
                  </div>
                </div>

                {/* Pie charts */}
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                  <div>
                    <div className="font-semibold text-center mb-2">Images Size Stats</div>
                    <div className="flex justify-center gap-4 items-center">
                      <div className="w-40 h-40">
                        <Pie
                          data={pieImagesSizeData}
                          options={pieOptions}
                          plugins={[piePercentPlugin]}
                        />
                      </div>
                      <PieLegend
                        labels={pieImagesSizeData.labels}
                        data={pieImagesSizeData.datasets[0].data}
                        colors={pieImagesSizeData.datasets[0].backgroundColor}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-center mb-2">PDF Size Stats</div>
                    <div className="flex justify-center gap-4 items-center">
                      <div className="w-40 h-40">
                        <Pie
                          data={piePdfsSizeData}
                          options={pieOptions}
                          plugins={[piePercentPlugin]}
                        />
                      </div>
                      <PieLegend
                        labels={piePdfsSizeData.labels}
                        data={piePdfsSizeData.datasets[0].data}
                        colors={piePdfsSizeData.datasets[0].backgroundColor}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
// This file is responsible for displaying file statistics charts in the admin dashboard.
// It fetches file counts and sizes from the API and renders bar and pie charts using Chart.js.
// The charts include:    