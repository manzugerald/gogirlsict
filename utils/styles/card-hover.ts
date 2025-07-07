import clsx from 'clsx';

export const cardHoverClass = clsx(
  'relative overflow-hidden rounded-xl transition-transform duration-300 perspective-[1200px]',
  'cursor-pointer',
  'bg-white text-gray-900 border border-gray-200 shadow-md shadow-gray-300/30',
  'hover:shadow-2xl hover:scale-[1.02] hover:border-violet-700 hover:shadow-violet-700/60',
  'dark:backdrop-blur-sm dark:bg-zinc-900/70 dark:text-white dark:border-card dark:shadow-md dark:shadow-black/30',
  'dark:hover:shadow-2xl dark:hover:scale-[1.02] dark:hover:border-pink-700 dark:hover:shadow-pink-700/50',
//   'hover:mb-8' 
);
