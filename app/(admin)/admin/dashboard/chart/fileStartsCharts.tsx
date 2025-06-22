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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes + ' B';
}

const pieModuleLabels = ['Projects', 'Events', 'Reports'];

export default function FilesStatsCharts() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    'Project Images': 0,
    'Project PDFs': 0,
    'Event Images': 0,
    'Event PDFs': 0,
    'Report Images': 0,
    'Report PDFs': 0,
  });
  const [sizes, setSizes] = useState({
    'Project Images': 0,
    'Project PDFs': 0,
    'Event Images': 0,
    'Event PDFs': 0,
    'Report Images': 0,
    'Report PDFs': 0,
  });

  useEffect(() => {
    setLoading(true);
    fetch('/api/file-stats')
      .then((r) => r.json())
      .then((res) => {
        setCounts(res.counts);
        setSizes(res.sizes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const barLabels = [
    'Project Images',
    'Project PDFs',
    'Event Images',
    'Event PDFs',
    'Report Images',
    'Report PDFs',
  ];
  const barColors = [
    '#7c3aed',
    '#a78bfa', // projects: images, pdfs
    '#059669',
    '#34d399', // events: images, pdfs
    '#f59e42',
    '#fdba74', // reports: images, pdfs
  ];

  // Bar chart for counts
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
        ],
        backgroundColor: barColors,
      },
    ],
  };

  // Pie for images (all modules)
  const pieImagesData = {
    labels: pieModuleLabels,
    datasets: [
      {
        label: 'Images Count',
        data: [counts['Project Images'], counts['Event Images'], counts['Report Images']],
        backgroundColor: ['#7c3aed', '#059669', '#f59e42'],
      },
    ],
  };
  // Pie for pdfs (all modules)
  const piePdfsData = {
    labels: pieModuleLabels,
    datasets: [
      {
        label: 'PDFs Count',
        data: [counts['Project PDFs'], counts['Event PDFs'], counts['Report PDFs']],
        backgroundColor: ['#a78bfa', '#34d399', '#fdba74'],
      },
    ],
  };

  // --- For sizes ---
  const barDataSizes = {
    labels: barLabels,
    datasets: [
      {
        label: 'Size (MB)',
        data: [
          +(sizes['Project Images'] / (1024 * 1024)).toFixed(2),
          +(sizes['Project PDFs'] / (1024 * 1024)).toFixed(2),
          +(sizes['Event Images'] / (1024 * 1024)).toFixed(2),
          +(sizes['Event PDFs'] / (1024 * 1024)).toFixed(2),
          +(sizes['Report Images'] / (1024 * 1024)).toFixed(2),
          +(sizes['Report PDFs'] / (1024 * 1024)).toFixed(2),
        ],
        backgroundColor: barColors,
      },
    ],
  };

  const pieImagesSizeData = {
    labels: pieModuleLabels,
    datasets: [
      {
        label: 'Images Size (MB)',
        data: [
          +(sizes['Project Images'] / (1024 * 1024)).toFixed(2),
          +(sizes['Event Images'] / (1024 * 1024)).toFixed(2),
          +(sizes['Report Images'] / (1024 * 1024)).toFixed(2),
        ],
        backgroundColor: ['#7c3aed', '#059669', '#f59e42'],
      },
    ],
  };

  const piePdfsSizeData = {
    labels: pieModuleLabels,
    datasets: [
      {
        label: 'PDFs Size (MB)',
        data: [
          +(sizes['Project PDFs'] / (1024 * 1024)).toFixed(2),
          +(sizes['Event PDFs'] / (1024 * 1024)).toFixed(2),
          +(sizes['Report PDFs'] / (1024 * 1024)).toFixed(2),
        ],
        backgroundColor: ['#a78bfa', '#34d399', '#fdba74'],
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
        ticks: { precision: 0 },
      },
    },
  };

  // Reduce pie chart size using maintainAspectRatio and setting height/width
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const },
      tooltip: { enabled: true },
      title: { display: false },
    },
  };

  return (
    <Card>
      <CardHeader className="font-bold text-lg">File Statistics</CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="flex flex-col gap-12">
            {/* File count bar and pies */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
              <div className="w-full md:w-1/2 h-72 flex flex-col items-center">
                <div className="mb-2 font-semibold">Number of Images and PDFs</div>
                <Bar data={barDataCounts} options={barOptions} />
              </div>
              <div className="w-full md:w-1/2 flex flex-row justify-center items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="mb-2 font-semibold">Image Count Distribution</div>
                  <div style={{ width: 170, height: 170 }}>
                    <Pie data={pieImagesData} options={pieOptions} />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-2 font-semibold">PDF Count Distribution</div>
                  <div style={{ width: 170, height: 170 }}>
                    <Pie data={piePdfsData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </div>
            {/* File size bar and pies */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
              <div className="w-full md:w-1/2 h-72 flex flex-col items-center">
                <div className="mb-2 font-semibold">Total Size of Images and PDFs (MB)</div>
                <Bar data={barDataSizes} options={barOptions} />
                <div className="text-xs mt-2">
                  {`Total Images Size: ${formatSize(
                    sizes['Project Images'] + sizes['Event Images'] + sizes['Report Images']
                  )}, Total PDFs Size: ${formatSize(
                    sizes['Project PDFs'] + sizes['Event PDFs'] + sizes['Report PDFs']
                  )}`}
                </div>
              </div>
              <div className="w-full md:w-1/2 flex flex-row justify-center items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="mb-2 font-semibold">Image Size Distribution (MB)</div>
                  <div style={{ width: 170, height: 170 }}>
                    <Pie data={pieImagesSizeData} options={pieOptions} />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-2 font-semibold">PDF Size Distribution (MB)</div>
                  <div style={{ width: 170, height: 170 }}>
                    <Pie data={piePdfsSizeData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
