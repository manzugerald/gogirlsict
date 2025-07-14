'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cardHoverClass } from '@/utils/styles/card-hover';

type Stat = {
  label: string;
  value: number;
  color?: string;
};

// ---- Slightly reduced dimensions, animation untouched ----
const CARD_MIN_WIDTH = 160;
const CARD_PADDING_X = 10;
const CARD_PADDING_Y = 8;
const SVG_SIZE = 90;
const CIRCLE_RADIUS = 33;
const CIRCLE_STROKE_WIDTH = 9;
const CIRCLE_DASHARRAY = 2 * Math.PI * CIRCLE_RADIUS;
const FONT_SIZE = 38;
const ANIMATION_DURATION = 10; // seconds
const CIRCLE_DELAY_STEP = 0.32;
const STAT_LABEL_FONT_SIZE = 15;

export default function AnimatedStats() {
  const pathname = usePathname();
  const showUsers = pathname === '/admin' || pathname.startsWith('/admin/');

  const [counts, setCounts] = useState<{
    projects: number;
    reports: number;
    events: number;
    users: number;
    institutions: number;
    beneficiaries: number;
  }>({
    projects: 0,
    reports: 0,
    events: 0,
    users: 0,
    institutions: 0,
    beneficiaries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      setLoading(true);
      try {
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
        setCounts({
          projects: Array.isArray(projects) ? projects.length : projects.count ?? 0,
          reports: Array.isArray(reports) ? reports.length : reports.count ?? 0,
          events: Array.isArray(events) ? events.length : events.count ?? 0,
          users: Array.isArray(users) ? users.length : users.count ?? 0,
          institutions: Array.isArray(institutions) ? institutions.length : institutions.count ?? 0,
          beneficiaries: Array.isArray(beneficiaries)
            ? beneficiaries.length
            : beneficiaries.count ?? 0,
        });
      } catch (err) {
        setCounts({
          projects: 0,
          reports: 0,
          events: 0,
          users: 0,
          institutions: 0,
          beneficiaries: 0,
        });
      }
      setLoading(false);
    }
    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="text-muted-foreground" style={{ fontSize: 24 }}>
          Loading stats...
        </span>
      </div>
    );
  }

  // Prepare stats to display
  const stats: Stat[] = [
    { label: 'Projects', value: counts.projects, color: '#7c3aed' },
    { label: 'Reports', value: counts.reports, color: '#f59e42' },
    { label: 'Events', value: counts.events, color: '#b87333' },
    { label: 'Institutions', value: counts.institutions, color: '#7c482b' },
    { label: 'Beneficiaries', value: counts.beneficiaries, color: '#059669' },
  ];
  if (showUsers) {
    stats.push({ label: 'Users', value: counts.users, color: '#2563eb' });
  }

  return (
    <div className="w-full">
      <div className="flex w-full gap-5 overflow-x-auto overflow-y-visible justify-center">
        <style>{`
        @keyframes progressCircleDash {
          0% {
            stroke-dashoffset: ${CIRCLE_DASHARRAY};
          }
          60% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: ${CIRCLE_DASHARRAY};
          }
        }
      `}</style>
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let start = 0;
    const end = stat.value;
    if (end === 0) {
      ref.current.textContent = '0';
      return;
    }
    const duration = 1800 + Math.random() * 800;
    const startTimestamp = performance.now();
    function animate(now: number) {
      const progress = Math.min((now - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      if (ref.current) ref.current.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [stat.value]);

  // Stagger circle animation for each stat
  const circleDelay = `${index * CIRCLE_DELAY_STEP}s`;

  return (
    <div
      className={
        cardHoverClass + ' flex flex-col items-center justify-center' // center everything in the card
      }
      style={{
        borderTop: `7px solid ${stat.color || '#7c3aed'}`,
        minWidth: CARD_MIN_WIDTH,
        padding: `${CARD_PADDING_Y}px ${CARD_PADDING_X}px`,
        height: 'auto',
        marginBottom: '16px',
      }}
    >
      <div
        className="flex items-center justify-center relative mb-2"
        style={{
          width: SVG_SIZE,
          height: SVG_SIZE,
          margin: '0 auto',
        }}
      >
        {/* Animated SVG Circle */}
        <svg
          width={SVG_SIZE}
          height={SVG_SIZE}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 0,
            display: 'block',
            margin: '0 auto',
          }}
        >
          <circle
            cx={SVG_SIZE / 2}
            cy={SVG_SIZE / 2}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={CIRCLE_STROKE_WIDTH}
          />
          <circle
            cx={SVG_SIZE / 2}
            cy={SVG_SIZE / 2}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={stat.color || '#7c3aed'}
            strokeWidth={CIRCLE_STROKE_WIDTH}
            strokeDasharray={CIRCLE_DASHARRAY}
            strokeDashoffset={CIRCLE_DASHARRAY}
            style={{
              transition: 'none',
              strokeLinecap: 'round',
              filter: `drop-shadow(0 0 8px ${stat.color || '#7c3aed'}66)`,
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              animation: `progressCircleDash ${ANIMATION_DURATION}s cubic-bezier(.56,1.84,.64,1) ${circleDelay} infinite`,
            }}
          />
        </svg>
        {/* The animated number */}
        <span
          ref={ref}
          className="flex items-center justify-center"
          style={{
            color: stat.color || '#7c3aed',
            position: 'relative',
            zIndex: 1,
            width: SVG_SIZE,
            height: SVG_SIZE,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
            userSelect: 'none',
            fontSize: FONT_SIZE,
            fontWeight: 800,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          0
        </span>
      </div>
      <span
        style={{
          fontSize: STAT_LABEL_FONT_SIZE,
          marginTop: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#6b7280',
          fontWeight: 600,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: CARD_MIN_WIDTH,
        }}
      >
        {stat.label}
      </span>
    </div>
  );
}
// This component displays animated stats cards with a progress circle animation.
// It fetches counts for projects, reports, events, users, institutions, and beneficiaries from the API.
// Each card shows a circular progress animation with the count value in the center.