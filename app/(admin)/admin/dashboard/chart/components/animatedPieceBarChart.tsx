'use client';

import { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { cardHoverClass } from '@/utils/styles/card-hover';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Added color for Beneficiaries. Institutions uses same as before.
const defaultColors = [
  '#7c3aed', // Projects
  '#f59e42', // Reports
  '#059669', // Events
  '#7c482b', // Institutions (same as in stats)
  '#2563eb', // Users
  '#eab308', // Beneficiaries (matches stats)
];

export default function AnimatedPieceBarChart({
  values = [7, 4, 9, 3, 6, 12],
  labels = ['Projects', 'Reports', 'Events', 'Institutions', 'Users', 'Beneficiaries'],
  colors = defaultColors,
  animationDuration = 1600, // ms for one fill
  loopPause = 800, // ms to show the full bar before restarting animation
}: {
  values?: number[];
  labels?: string[];
  colors?: string[];
  animationDuration?: number;
  loopPause?: number;
}) {
  const [progress, setProgress] = useState(0); // 0 to 1
  const [loopKey, setLoopKey] = useState(0); // change to restart animation
  const chartRef = useRef<any>(null);

  // Looping fill animation
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    let stopped = false;

    function animate(ts: number) {
      if (stopped) return;
      if (start === null) start = ts;
      const elapsed = ts - start;
      let pct = Math.min(elapsed / animationDuration, 1);
      setProgress(pct);

      if (pct < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        // Pause with full bar, then restart
        setTimeout(() => {
          if (!stopped) {
            setProgress(0);
            setLoopKey((k) => k + 1);
          }
        }, loopPause);
      }
    }
    frame = requestAnimationFrame(animate);

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line
  }, [loopKey, animationDuration, loopPause, values.join(',')]);

  // Force chart update on each progress step
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [progress, values]);

  // Animate values from 0 to target value based on progress
  const animatedData = values.map((v) => Math.round(v * progress * 100) / 100);

  const barData = {
    labels,
    datasets: [
      {
        label: 'Count',
        data: animatedData,
        backgroundColor: colors.slice(0, labels.length),
        borderRadius: 7,
        borderWidth: 0,
        maxBarThickness: 80,
      },
    ],
  };

  const yMax = Math.max(1, ...values);

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    animation: false, // we control animation manually
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: yMax,
        ticks: {
          font: { size: 14 },
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          font: { size: 14 },
        },
      },
    },
  };

  return (
    <div className="w-full h-[250px]">
      <Bar ref={chartRef} data={barData} options={barOptions} />
    </div>
  );
}
// This component displays a bar chart with animated filling bars based on provided values and labels, including Institutions and Beneficiaries.
// It uses Chart.js for rendering and supports custom colors, animation duration, and loop pause.