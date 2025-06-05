'use client';

import { Button } from "@/components/ui/button";
import ModeToggle from "../header/mode-toggle";
import { LogIn, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";

const AdminMenu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const isLoginPage = pathname === "/admin";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleLogin = async () => {
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
          {session?.user && (
            <>
              <span className="font-medium text-sm">
                Hello, {session.user.firstName} {session.user.lastName}
              </span>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-1 w-4 h-4" /> Logout
              </Button>
              <ModeToggle />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminMenu;
