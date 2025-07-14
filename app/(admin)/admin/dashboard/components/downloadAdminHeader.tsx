'use client';

import Image from 'next/image';

interface DownloadAdminHeaderProps {
  cardName: string;
}

const DownloadAdminHeader = ({ cardName }: DownloadAdminHeaderProps) => (
  <header className="w-full flex items-center bg-[#9f004d] h-16 px-4">
    <div className="flex items-center gap-4 w-full">
      <Image
        src="/assets/images/system/goGirlsLogoV2.svg"
        alt="GoGirls ICT Initiative logo"
        height={48}
        width={48}
        priority
      />
      <span className="font-bold text-lg text-white">GoGirls ICT Initiative</span>
      <span className="ml-6 text-lg text-white font-semibold">{cardName}</span>
    </div>
  </header>
);

export default DownloadAdminHeader;
