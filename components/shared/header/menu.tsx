'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Menu as MenuIcon, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import ModeToggle from './mode-toggle';

const Menu = () => {
  const [showResources, setShowResources] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type');

  const isActive = (type: string) => pathname === '/resources' && currentType === type;
  const isResourcesActive =
    pathname === '/resources' &&
    ['Videos', 'Reports', 'Articles', 'Gallery'].includes(currentType || '');

  const linkBase =
    'text-[15px] font-medium text-muted-foreground transition-colors px-2 py-1 rounded hover:text-foreground hover:bg-accent';
  const activeClass = 'text-primary font-semibold bg-accent';

  return (
    <div className="flex justify-end items-center gap-3">
      {/* Desktop Menu */}
      <nav className="hidden md:flex items-center gap-4 ml-auto">
        <Link href="/" className={clsx(linkBase, pathname === '/' && activeClass)}>
          Home
        </Link>
        <Link href="/projects" className={clsx(linkBase, pathname === '/projects' && activeClass)}>
          Projects
        </Link>

        {/* Resources Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={clsx(
                'text-[15px] px-2 py-1 flex items-center gap-1 rounded transition-colors',
                isResourcesActive
                  ? activeClass
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              Resources <ChevronDown className="w-4 h-4 transition-transform" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-xl shadow-xl p-2 w-56">
            {['Videos', 'Reports', 'Articles', 'Gallery'].map((type, idx) => (
              <div key={type}>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/resources?type=${type}`}
                    className={clsx(
                      'text-[15px] w-full px-2 py-1.5 rounded-md transition-colors',
                      isActive(type)
                        ? 'bg-accent text-primary font-semibold'
                        : 'hover:bg-accent text-foreground'
                    )}
                  >
                    {type === 'Videos' ? 'Videos & OERs' : type}
                  </Link>
                </DropdownMenuItem>
                {idx < 3 && <DropdownMenuSeparator />}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          href="/get-involved"
          className={clsx(linkBase, pathname === '/get-involved' && activeClass)}
        >
          Get Involved
        </Link>

        <Button
          asChild
          variant="outline"
          className="rounded-full px-4 py-1.5 shadow-sm hover:shadow-md"
        >
          <Link href="/donate" className="flex items-center gap-1 text-[15px]">
            <ShoppingCart className="w-4 h-4" /> Donate
          </Link>
        </Button>

        <ModeToggle />
      </nav>

      {/* Mobile Menu */}
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <MenuIcon />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start gap-4 pt-8">
            <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>

            <Link href="/" className={clsx(linkBase, pathname === '/' && activeClass)}>
              Home
            </Link>
            <Link
              href="/projects"
              className={clsx(linkBase, pathname === '/projects' && activeClass)}
            >
              Projects
            </Link>

            <button
              onClick={() => setShowResources(!showResources)}
              className={clsx(
                'w-full text-left flex items-center justify-between py-2 text-[15px] font-medium',
                isResourcesActive && activeClass
              )}
            >
              Resources{' '}
              {showResources ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showResources && (
              <div className="ml-3 flex flex-col gap-1 w-full">
                {['Videos', 'Reports', 'Articles', 'Gallery'].map((type) => (
                  <Link
                    key={type}
                    href={`/resources?type=${type}`}
                    className={clsx(linkBase, isActive(type) && activeClass, 'w-full')}
                  >
                    {type === 'Videos' ? 'Videos & OERs' : type}
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/get-involved"
              className={clsx(linkBase, pathname === '/get-involved' && activeClass)}
            >
              Get Involved
            </Link>

            <Button asChild variant="outline" className="rounded-full">
              <Link href="/donate" className="flex items-center gap-1 text-[15px]">
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
