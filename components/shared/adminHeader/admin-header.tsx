'use client';

import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import AdminMenu from "./adminMenu";
import { useSession, signOut } from "next-auth/react";

const AdminHeader = () => {
  const { data: session, status } = useSession();
  return (
    <header className="w-full flex items-center justify-between bg-[#9f004d] h-12">
      <div className="wrapper flex-between w-full">
        <Link href="/" className="flex items-center">
          <Image
            src="/assets/images/system/goGirlsLogoV2.svg"
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
          <AdminMenu
            isAuthenticated={status === "authenticated"}
            user={{
              firstName: session?.user?.firstName || "",
              lastName: session?.user?.lastName || "",
              image: session?.user?.image || undefined,
            }}
          />
        </>
      </div>
    </header>
  );
};

export default AdminHeader;
