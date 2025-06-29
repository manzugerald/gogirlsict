import CardDogEar from "@/components/shared/cards/cardDogEar";
import MessageCard from "@/components/shared/home/messageCard";
import { getHomePageContent } from "@/lib/actions/homepage";
import { getAllMessages } from "@/lib/actions/programsDirectorMessage";
import { EyeIcon, FocusIcon, HeartIcon, StarIcon, TargetIcon } from "lucide-react";
import DashboardChart from '../(admin)/admin/dashboard/chart/dashboardChart';
import FacebookFeed from '@/components/shared/facebook/facebookFeed';

export const metadata = {
  title: 'Home',
};

export default async function HomePage() {
  const content = await getHomePageContent();
  const message = await getAllMessages();
  const messageContent = message?.[0];

  if (!content) return <div>No Home Page content found</div>;

  return (
    <>
      {/* Hero Section - matches header style */}
      <div className="w-full h-[40vh]">
        <video
          src={content.heroVideo}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

      {/* Text Content Section */}
      {/* Text Content Section */}
      <section className="wrapper space-y-8 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-2">
          <CardDogEar title="Vision" content={content.vision} icon={EyeIcon} />
          <CardDogEar title="Mission" content={content.mission} icon={TargetIcon} />
          <CardDogEar title="Focus" content={content.focus} icon={FocusIcon} />
          <CardDogEar title="Core Values" content={content.coreValues} icon={HeartIcon} />
        </div>
      </section>

      <MessageCard
        name={messageContent.name}
        title={messageContent.title}
        message={messageContent.message}
        imageUrl={messageContent.nameImageUrl}
      />

      <div className="wrapper py-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* DashboardChart takes 2/3 */}
          <div className="md:w-2/3 w-full">
            <DashboardChart />
          </div>

          {/* FacebookFeed takes 1/3 and auto height */}
          <div className="md:w-1/3 w-full">
            <FacebookFeed />
          </div>
        </div>
      </div>
    </>
  );
}
