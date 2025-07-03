'use client';

import { usePathname, useSearchParams } from 'next/navigation';

const ICONS = {
  home: (
    <span className="mr-1" role="img" aria-label="Home">
      🏠
    </span>
  ),
  folder: (
    <span className="mr-1" role="img" aria-label="Folder">
      📁
    </span>
  ),
  page: (
    <span className="mr-1" role="img" aria-label="Page">
      📄
    </span>
  ),
};

function titleCase(str: string) {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

const TYPE_LABELS: Record<string, string> = {
  videos: 'Videos',
  reports: 'Reports',
  projects: 'Projects',
};

type CrumbType = 'home' | 'folder' | 'page';
type Crumb = {
  href: string;
  icon: JSX.Element;
  label: string;
  type: CrumbType;
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathSegments = pathname.split('/').filter(Boolean);

  const type = searchParams.get('type');
  const typeLabel = type ? TYPE_LABELS[type.toLowerCase()] || titleCase(type) : null;

  // Always start with Home
  const crumbs: Crumb[] = [
    {
      href: '/',
      icon: ICONS.home,
      label: 'Home',
      type: 'home',
    },
  ];

  // Add folder icon for each path segment (never "page" icon here)
  let accumulatedPath = '';
  pathSegments.forEach((segment) => {
    accumulatedPath += '/' + segment;
    crumbs.push({
      href: accumulatedPath,
      icon: ICONS.folder,
      label: titleCase(decodeURIComponent(segment)),
      type: 'folder',
    });
  });

  // Add the page: from type param or repeat the last path segment (page icon)
  if (typeLabel) {
    const folderHref = '/' + pathSegments.join('/');
    crumbs.push({
      href: `${folderHref}?type=${type}`,
      icon: ICONS.page,
      label: typeLabel,
      type: 'page',
    });
  } else if (pathSegments.length > 0) {
    // Show last segment again as the page
    const lastSegment = pathSegments[pathSegments.length - 1];
    const lastHref = '/' + pathSegments.join('/');
    crumbs.push({
      href: lastHref,
      icon: ICONS.page,
      label: titleCase(decodeURIComponent(lastSegment)),
      type: 'page',
    });
  }

  // Only render unique folder segments (no duplicate consecutive)
  const filteredCrumbs: Crumb[] = [];
  crumbs.forEach((crumb, i) => {
    // If folder and previous crumb has same label, skip this one
    if (
      crumb.type === 'folder' &&
      filteredCrumbs.length &&
      filteredCrumbs[filteredCrumbs.length - 1].label === crumb.label
    ) {
      return;
    }
    filteredCrumbs.push(crumb);
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="fixed top-[40px] left-0 z-40 h-auto min-h-[40px] py-auto px-6 flex items-center"
      style={{ width: 'fit-content', maxWidth: '100vw' }}
    >
      <span className="mr-4 font-semibold text-neutral-600 dark:text-neutral-300 select-none whitespace-nowrap">
        You are here:
      </span>
      <ol className="flex flex-row flex-wrap items-center text-sm space-x-0 bg-white/80 dark:bg-neutral-900/80 shadow px-2">
        {filteredCrumbs.map((crumb, idx) => {
          const isLast = idx === filteredCrumbs.length - 1;
          if (crumb.type === 'page' && isLast) {
            return (
              <li key={crumb.href + '-' + crumb.type} className="flex items-center">
                <span className="flex items-center font-semibold text-neutral-900 dark:text-neutral-100">
                  {crumb.icon}
                  <span className="text-neutral-900 dark:text-neutral-100">{crumb.label}</span>
                </span>
              </li>
            );
          } else {
            return (
              <li key={crumb.href + '-' + crumb.type} className="flex items-center">
                <a
                  href={crumb.href}
                  className="flex items-center text-pink-700 dark:text-pink-400 hover:underline"
                >
                  {crumb.icon}
                  <span className="text-neutral-900 dark:text-neutral-100">{crumb.label}</span>
                </a>
                <span className="mx-2 text-neutral-400 dark:text-neutral-500">{'>'}</span>
              </li>
            );
          }
        })}
      </ol>
    </nav>
  );
}
