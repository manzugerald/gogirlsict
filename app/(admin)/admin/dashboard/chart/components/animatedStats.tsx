'use client';

import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';

type Stat = {
  label: string;
  value: number;
  color: string;
};

const ANIMATION_DURATION = 2.2;
const CIRCLE_RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function AnimatedStats({ stats }: { stats: Stat[] }) {
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setLoop((v) => v + 1), (ANIMATION_DURATION + 0.7) * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={loop}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-wrap justify-center gap-8"
      >
        {stats.map(({ label, value, color }, i) => (
          <motion.div
            key={`${label}-${loop}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center min-w-[100px]"
          >
            <div className="relative w-28 h-28">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r={CIRCLE_RADIUS}
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="none"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r={CIRCLE_RADIUS}
                  stroke={color}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE}
                  animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - 1) }}
                  transition={{
                    duration: ANIMATION_DURATION,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  }}
                  key={loop}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CountUp
                  start={0}
                  end={value}
                  duration={ANIMATION_DURATION}
                  separator=","
                  className="text-2xl font-extrabold"
                  style={{ color }}
                  key={loop}
                  redraw
                />
              </div>
            </div>

            <span className="mt-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
              {label}
            </span>

            <motion.div
              className="mt-1 h-1 w-12 rounded-full"
              style={{ backgroundColor: color }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: i * 0.15 + 0.2,
                duration: ANIMATION_DURATION,
                ease: 'easeOut',
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
