'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const scrollProgress = useMotionValue(0);

  const smoothProgress = useSpring(scrollProgress, {
    stiffness: 60, // Lower stiffness = smoother
    damping: 20,
    mass: 0.2,
  });

  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      scrollProgress.set(progress);
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    return () => window.removeEventListener('scroll', updateScroll);
  }, [scrollProgress]);

  return (
    <div className="fixed top-11 left-0 w-full z-50 pointer-events-none">
      <motion.div
        className="h-1 bg-pink-500 origin-left"
        style={{ scaleX: smoothProgress, width: '100%' }}
      />
    </div>
  );
}
