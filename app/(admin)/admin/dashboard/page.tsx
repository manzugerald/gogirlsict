import CardDogEar from "@/components/shared/cards/cardDogEar";
import { EyeIcon, SettingsIcon, ShieldIcon, Users2Icon } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: 'Admin Dashboard',
};

export default function AdminDashboard() {
  return (
    <>
      {/* Admin Hero Section */}
      {/* Hero Section - matches header style */}
      <div className="w-full h-[40vh] relative mt-0">
        <Image
          src='/images/admin/hero2.jpg'
          className="object-cover"
          alt="GoGirls ICT Initiative Admin Hero"
          fill
        />
      </div>

      {/* Admin Overview Cards */}
      <section className="wrapper space-y-8 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-2">
          <CardDogEar
            title="Users"
            content="Manage registered users, roles and permissions"
            icon={Users2Icon}
            href="/admin/register"
          />
          <CardDogEar
            title="Site Settings"
            content="Update homepage content, banners and site info"
            icon={SettingsIcon}
            href="/admin/register"
          />
          <CardDogEar
            title="Reports"
            content="Review uploaded reports and documents"
            icon={EyeIcon}
            href="/admin/register"
          />
          <CardDogEar
            title="Access Control"
            content="Audit logs and administrative privileges"
            icon={ShieldIcon}
            href="/admin/register"
          />
        </div>
      </section>
    </>
  );
}
