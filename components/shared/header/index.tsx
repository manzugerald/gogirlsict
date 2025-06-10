import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";

const Header = () => {
  return (
    <header className="w-full bg-[#9f004d] h-12 flex items-center">
      <div className="w-full max-w-screen-xl mx-auto flex items-center px-4 gap-4">
        {/* Logo + App Name */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/assets/images/system/goGirlsLogoV2.svg"
            alt={`${APP_NAME} logo`}
            height={60}
            width={60}
            priority={true}
          />
          <span className="hidden lg:block font-bold text-lg ml-3 text-white">
            {APP_NAME}
          </span>
        </Link>

        {/* Menu fills the remaining space */}
        <div className="flex-grow">
          <Menu />
        </div>
      </div>
    </header>
  );
};

export default Header;
