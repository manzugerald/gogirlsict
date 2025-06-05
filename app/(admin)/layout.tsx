// app/(admin)/layout.tsx
'use client';

import { SessionProvider } from "next-auth/react";
import AdminHeader from "@/components/shared/adminHeader/admin-header";
import Footer from "@/components/footer";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex h-screen flex-col">
        <AdminHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </SessionProvider>
  );
}
