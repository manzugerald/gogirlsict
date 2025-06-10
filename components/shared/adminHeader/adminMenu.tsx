'use client';

import { Button } from "@/components/ui/button";
import ModeToggle from "../header/mode-toggle";
import { LogIn, LogOut } from "lucide-react";
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
              <div className="w-8 h-8 relative rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
                <Image
                  src={user.image || "/default-avatar.png"}
                  alt={`${user.firstName} ${user.lastName}`}
                  fill
                  className="object-cover"
                />
              </div>
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
