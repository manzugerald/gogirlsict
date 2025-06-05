'use client';

import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import AdminMenu from "./adminMenu";
import { usePathname } from "next/navigation";

const AdminHeader = () => {
  return (
    <header className="w-full flex items-center justify-between bg-[#9f004d] h-12">
      <div className="wrapper flex-between w-full">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/goGirlsLogoV2.svg"
            alt={`${APP_NAME} logo`}
            height={60}
            width={60}
            priority
          />
          <span className="hidden lg:block font-bold text-lg ml-3 text-white">
            {APP_NAME}
          </span>
        </Link>

        <>
          <h2 className="text-xl text-white">Welcome to the Admin Dashboard</h2>
          <AdminMenu />
        </>
      </div>
    </header>
  );
};

export default AdminHeader;
