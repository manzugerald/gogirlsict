'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu as MenuIcon, ShoppingCart, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import ModeToggle from "./mode-toggle";
import { useState } from "react";
import clsx from "clsx";

const Menu = () => {
  const [showResources, setShowResources] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type");

  const isActive = (type: string) => pathname === "/resources" && currentType === type;
  const isResourcesActive =
    pathname === "/resources" &&
    ["Videos", "Reports", "Articles", "Gallery"].includes(currentType || "");

  const linkBase = "text-sm px-3 py-2 rounded hover:underline";
  const activeClass = "text-primary underline font-medium";

  return (
    <div className="flex justify-end gap-3">
      {/* Desktop Menu */}
      <nav className="hidden md:flex w-full max-w-xl gap-1 items-center">
        <Link href="/" className={clsx(linkBase, pathname === "/" && activeClass)}>
          Home
        </Link>
        <Link href="/projects" className={clsx(linkBase, pathname === "/projects" && activeClass)}>
          Projects
        </Link>

        {/* Resources Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={clsx("text-sm flex items-center gap-1", isResourcesActive && activeClass)}
            >
              Resources <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild>
              <Link
                href="/resources?type=Videos"
                className={clsx("text-sm", isActive("Videos") && activeClass)}
              >
                Videos & OERs
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/resources?type=Reports"
                className={clsx("text-sm", isActive("Reports") && activeClass)}
              >
                Reports
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
                      
            <DropdownMenuItem asChild>
              <Link
                href="/resources?type=Articles"
                className={clsx("text-sm", isActive("Articles") && activeClass)}
              >
                Articles
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
                      
            <DropdownMenuItem asChild>
              <Link
                href="/resources?type=Gallery"
                className={clsx("text-sm", isActive("Gallery") && activeClass)}
              >
                Gallery
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          href="/get-involved"
          className={clsx(linkBase, pathname === "/get-involved" && activeClass)}
        >
          Get Involved
        </Link>

        <Button asChild variant="ghost">
          <Link href="/donate">
            <ShoppingCart className="mr-1 w-4 h-4" /> Donate
          </Link>
        </Button>

        <ModeToggle />
      </nav>

      {/* Mobile Menu */}
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle">
            <MenuIcon />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start gap-2">
            <SheetTitle>Menu</SheetTitle>

            <Link
              href="/"
              className={clsx("text-sm pl-3", pathname === "/" && activeClass)}
            >
              Home
            </Link>
            <Link
              href="/projects"
              className={clsx("text-sm pl-3", pathname === "/projects" && activeClass)}
            >
              Projects
            </Link>

            {/* Resources expandable menu */}
            <button
              onClick={() => setShowResources((prev) => !prev)}
              className={clsx("text-sm text-left w-full py-1 pl-3", isResourcesActive && activeClass)}
            >
              Resources {showResources ? "▲" : "▼"}
            </button>
            {showResources && (
              <div className="ml-6 flex flex-col gap-1">
                <Link
                  href="/resources?type=Videos"
                  className={clsx("text-sm", isActive("Videos") && activeClass)}
                >
                  Videos & OERs
                </Link>
                <Link
                  href="/resources?type=Reports"
                  className={clsx("text-sm", isActive("Reports") && activeClass)}
                >
                  Reports
                </Link>
                <Link
                  href="/resources?type=Articles"
                  className={clsx("text-sm", isActive("Articles") && activeClass)}
                >
                  Articles
                </Link>
                <Link
                  href="/resources?type=Gallery"
                  className={clsx("text-sm", isActive("Gallery") && activeClass)}
                >
                  Gallery
                </Link>
              </div>
            )}

            <Link
              href="/get-involved"
              className={clsx("text-sm pl-3", pathname === "/get-involved" && activeClass)}
            >
              Get Involved
            </Link>

            <Button asChild variant="ghost" className="pl-3">
              <Link href="/donate">
                <ShoppingCart className="mr-1 w-4 h-4" /> Donate
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
