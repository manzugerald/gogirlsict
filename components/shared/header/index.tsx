'use client';

import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import Menu from './menu';

const Header = () => {
  return (
    <header className="fixed top-0 z-50 w-full bg-[#9f004d]/95 backdrop-blur-md shadow-md h-14 flex items-center">
      <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between px-4">
        {/* Logo + App Name */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/assets/images/system/goGirlsLogoV2.svg"
            alt={`${APP_NAME} logo`}
            height={40}
            width={40}
            className="h-auto"
            priority
          />
          <span className="hidden lg:inline text-white text-lg font-semibold tracking-wide">
            {APP_NAME}
          </span>
        </Link>

        {/* Right-aligned Menu */}
        <div className="ml-auto">
          <Menu />
        </div>
      </div>
    </header>
  );
};

export default Header;
