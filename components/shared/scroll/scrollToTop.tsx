'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowUp } from 'react-icons/fa';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-to-top"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-4 z-50 bg-pink-700 hover:bg-pink-900 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none"
          aria-label="Scroll to top"
          style={{
            minWidth: '3.5rem',
            minHeight: '3.5rem',
            maxWidth: '3.5rem',
            maxHeight: '3.5rem',
            boxSizing: 'border-box',
            right: '1rem', // ensures it never causes horizontal scroll
            left: 'auto',
          }}
        >
          <motion.span
            initial={{ color: '#fff' }}
            animate={{
              color: [
                '#fff', // white
                '#111827', // Next.js dark theme black
                '#fff',
              ],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex items-center justify-center w-6 h-6"
            style={{ borderRadius: '9999px' }}
          >
            <FaArrowUp size={24} />
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
