'use client';

import { Button } from "@/components/ui/button";
import ModeToggle from "../header/mode-toggle";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

interface AdminMenuProps {
  isAuthenticated: boolean;
  user?: {
    firstName: string;
    lastName: string;
    image?: string;
  };
}

const AdminMenu = ({ isAuthenticated, user }: AdminMenuProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin";

  if (isAuthenticated && user) {
    console.log("AdminMenu User:", {
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image, 
    });
  }

  const handleLogout = async () => {
    // Call signOut where this component is used
    router.push("/api/auth/signout"); // or handle via props callback
  };

  const handleLogin = () => {
    router.push("/admin");
  };

  return (
    <div className="flex items-center gap-4">
      {isLoginPage ? (
        <>
          <Button variant="ghost" onClick={handleLogin}>
            <LogIn className="mr-1 w-4 h-4" /> Login
          </Button>
          <ModeToggle />
        </>
      ) : (
        <>
          {isAuthenticated && user && (
            <div className="flex items-center gap-2">
              {/* Avatar or user image */}
              {user.image ? (
                <div className="w-8 h-8 relative rounded-full overflow-hidden border border-[#9f004d] dark:border-[#9f004d]">
                  <Image
                    src={user.image}
                    alt={`${user.firstName} ${user.lastName}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-muted border border-gray-300 dark:border-gray-600">
                  <UserIcon className="w-5 h-5 text-muted-foreground" />
                </span>
              )}
              <span className="font-medium text-sm text-foreground">
                Hello, {user.firstName} {user.lastName}
              </span>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-1 w-4 h-4" /> Logout
              </Button>
              <ModeToggle />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminMenu;
