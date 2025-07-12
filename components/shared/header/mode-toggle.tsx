'use client';

import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon, SunMoon } from 'lucide-react';
import clsx from 'clsx';

const themes = [
  {
    name: 'Dark',
    value: 'dark',
    icon: MoonIcon,
  },
  {
    name: 'Light',
    value: 'light',
    icon: SunIcon,
  },
  {
    name: 'System',
    value: 'system',
    icon: SunMoon,
  },
];

const ModeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);

    // Set default to dark on first visit if no theme is stored
    if (!localStorage.getItem('theme')) {
      setTheme('dark');
    }
  }, []);

  if (!mounted) return null;

  const ThemeIcon = theme === 'system' ? SunMoon : theme === 'dark' ? MoonIcon : SunIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Toggle theme"
          className="p-2 rounded-full transition hover:scale-105 hover:bg-accent focus-visible:ring-0"
        >
          <ThemeIcon className="w-5 h-5 text-foreground transition-transform duration-300" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44 p-2 rounded-xl shadow-xl z-[150]">
        <DropdownMenuLabel className="text-xs text-muted-foreground mb-1">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map(({ name, value, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={clsx(
              'flex items-center gap-2 text-sm px-2 py-1.5 rounded-md transition-colors my-1',
              theme === value
                ? 'bg-accent font-semibold text-primary'
                : 'hover:bg-accent text-foreground'
            )}
          >
            <Icon className="w-4 h-4" />
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModeToggle;
