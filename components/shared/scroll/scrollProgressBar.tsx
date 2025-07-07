'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const scrollProgress = useMotionValue(0);

  const smoothProgress = useSpring(scrollProgress, {
    stiffness: 60,
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
    <div className="fixed top-14 left-0 w-full z-[100] pointer-events-none">
      <motion.div
        className="h-[4px] origin-left rounded-r-full bg-gradient-to-r from-[#ff4d94] via-pink-500 to-pink-400 shadow-md shadow-pink-500/30 dark:shadow-pink-300/20 transition-all duration-300"
        style={{ scaleX: smoothProgress, width: '100%' }}
      />
    </div>
  );
}
