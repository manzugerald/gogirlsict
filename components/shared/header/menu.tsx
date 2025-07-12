'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useSWR from 'swr';
import clsx from 'clsx';
import { Menu as MenuIcon, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import ModeToggle from './mode-toggle';
import { menuData } from './menu-data';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const Menu = () => {
  const [showResources, setShowResources] = useState(false);
  const [hoveringProjects, setHoveringProjects] = useState(false);
  const [hoveringResources, setHoveringResources] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data, isLoading } = useSWR('/api/menu', fetcher, {
    fallbackData: menuData,
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1000,
  });

  // Prefetch important menu routes for instant nav
  // (Add any additional routes you want preloaded)
  // This can be skipped if not needed for instant feel

  const counts = data.counts;

  const linkBase =
    'text-[15px] font-medium text-muted-foreground transition-colors px-2 py-1 rounded hover:text-foreground hover:bg-accent';
  const activeClass = 'text-primary font-semibold bg-accent';

  return (
    <div className="flex justify-end items-center gap-3">
      {/* Desktop Menu */}
      <nav className="hidden md:flex items-center gap-4 ml-auto">
        {/* Home */}
        <Link href="/" prefetch={true} className={clsx(linkBase, pathname === '/' && activeClass)}>
          Home
        </Link>
        {/* Projects with count on hover */}
        <div
          className="relative"
          onMouseEnter={() => setHoveringProjects(true)}
          onMouseLeave={() => setHoveringProjects(false)}
        >
          <Link
            href="/projects"
            prefetch={true}
            className={clsx(
              linkBase,
              pathname === '/projects' && activeClass,
              'flex items-center gap-1'
            )}
          >
            Projects
            {hoveringProjects && (
              <span className="ml-2 text-xs text-muted-foreground bg-accent rounded-full px-2 py-0.5">
                {counts.projects}
              </span>
            )}
          </Link>
        </div>
        {/* Resources Dropdown - counts always visible */}
        <div
          className="relative"
          onMouseEnter={() => setHoveringResources(true)}
          onMouseLeave={() => setHoveringResources(false)}
        >
          <Button
            variant="ghost"
            className={clsx(
              'text-[15px] px-2 py-1 flex items-center gap-1 rounded transition-colors',
              pathname.startsWith('/resources')
                ? activeClass
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            Resources
            <ChevronDown
              className={clsx('w-4 h-4 transition-transform', hoveringResources && 'rotate-180')}
            />
          </Button>
          {hoveringResources && (
            <div className="absolute top-10 z-50 bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-2 w-56">
              <Link
                href="/resources/videos"
                prefetch={true}
                className="block text-[15px] px-3 py-2 rounded-md transition-colors hover:bg-accent text-foreground flex justify-between"
              >
                <span>Videos & OERs</span>
                <span className="text-xs text-muted-foreground">{counts.videos}</span>
              </Link>
              <DropdownMenuSeparator />
              <Link
                href="/resources/reports"
                prefetch={true}
                className="block text-[15px] px-3 py-2 rounded-md transition-colors hover:bg-accent text-foreground flex justify-between"
              >
                <span>Reports</span>
                <span className="text-xs text-muted-foreground">{counts.reports}</span>
              </Link>
            </div>
          )}
        </div>
        {/* Gallery */}
        <Link
          href="/gallery"
          prefetch={true}
          className={clsx(linkBase, pathname === '/gallery' && activeClass)}
        >
          Gallery
        </Link>
        {/* Get Involved */}
        <Link
          href="/get-involved"
          prefetch={true}
          className={clsx(linkBase, pathname === '/get-involved' && activeClass)}
        >
          Get Involved
        </Link>
        {/* Donate */}
        <Button
          asChild
          variant="outline"
          className="rounded-full px-4 py-1.5 shadow-sm hover:shadow-md"
        >
          <Link href="/donate" prefetch={true} className="flex items-center gap-1 text-[15px]">
            <ShoppingCart className="w-4 h-4" /> Donate
          </Link>
        </Button>
        {/* Mode Toggle */}
        <ModeToggle />
      </nav>
      {/* Mobile Menu - simplified, counts always visible */}
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <MenuIcon />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start gap-4 pt-8">
            <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
            <Link
              href="/"
              prefetch={true}
              className={clsx(linkBase, pathname === '/' && activeClass)}
            >
              Home
            </Link>
            <Link
              href="/projects"
              prefetch={true}
              className={clsx(
                linkBase,
                pathname === '/projects' && activeClass,
                'flex items-center gap-1'
              )}
            >
              Projects
              <span className="ml-2 text-xs text-muted-foreground bg-accent rounded-full px-2 py-0.5">
                {counts.projects}
              </span>
            </Link>
            {/* Resources dropdown always open in mobile */}
            <div className="ml-3 flex flex-col gap-1 w-full">
              <span className="text-[15px] font-medium mt-2 mb-1">Resources</span>
              <Link
                href="/resources/videos"
                prefetch={true}
                className={clsx(
                  linkBase,
                  pathname === '/resources/videos' && activeClass,
                  'w-full flex justify-between'
                )}
              >
                <span>Videos & OERs</span>
                <span className="text-xs text-muted-foreground">{counts.videos}</span>
              </Link>
              <Link
                href="/resources/reports"
                prefetch={true}
                className={clsx(
                  linkBase,
                  pathname === '/resources/reports' && activeClass,
                  'w-full flex justify-between'
                )}
              >
                <span>Reports</span>
                <span className="text-xs text-muted-foreground">{counts.reports}</span>
              </Link>
            </div>
            <Link
              href="/gallery"
              prefetch={true}
              className={clsx(linkBase, pathname === '/gallery' && activeClass)}
            >
              Gallery
            </Link>
            <Link
              href="/get-involved"
              prefetch={true}
              className={clsx(linkBase, pathname === '/get-involved' && activeClass)}
            >
              Get Involved
            </Link>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/donate" prefetch={true} className="flex items-center gap-1 text-[15px]">
                <ShoppingCart className="w-4 h-4" /> Donate
              </Link>
            </Button>
            <ModeToggle />
            <SheetDescription />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
