import CardDogEar from '@/components/shared/cards/cardDogEar';
import MessageCard from '@/components/shared/home/messageCard';
import { getHomePageContent } from '@/lib/actions/homepage';
import { getAllMessages } from '@/lib/actions/programsDirectorMessage';
import { EyeIcon, FocusIcon, HeartIcon, TargetIcon } from 'lucide-react';
import DashboardChart from '../(admin)/admin/dashboard/chart/dashboardChart';
import FacebookFeed from '@/components/shared/facebook/facebookFeed';
import AnimatedStats from '../(admin)/admin/dashboard/chart/animatedStats';
import HeroVideo from '@/components/shared/heroVideo/heroVideo';
import FacebookPostsCard from '@/components/shared/facebookPostsCard/facebookPostsCard';
import ReportsSection from './resources/reports/reportsSection';

// export const metadata = {
//   title: 'Home',
// };

// Manually add image urls for the cards
const visionImg = '/assets/images/vision-mission-values/vision.png';
const missionImg = '/assets/images/vision-mission-values/mission.png';
const focusImg = '/assets/images/vision-mission-values/focus.png';
const valuesImg = '/assets/images/vision-mission-values/values.png';

export default async function HomePage() {
  const content = await getHomePageContent();
  const message = await getAllMessages();
  const messageContent = message?.[0];

  if (!content) return <div>No Home Page content found</div>;

  return (
    <>
      <HeroVideo src={content.heroVideo} />
      {/* Text Content Section */}
      <section className="wrapper max-w-7xl mx-auto px-4 space-y-8 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-2">
          <CardDogEar title="Vision" content={content.vision} icon={EyeIcon} imgUrl={visionImg} />
          <CardDogEar
            title="Mission"
            content={content.mission}
            icon={TargetIcon}
            imgUrl={missionImg}
          />
          <CardDogEar title="Focus" content={content.focus} icon={FocusIcon} imgUrl={focusImg} />
          <CardDogEar
            title="Core Values"
            content={content.coreValues}
            icon={HeartIcon}
            imgUrl={valuesImg}
          />
        </div>
      </section>

      {/* <MessageCard
        name={messageContent?.name}
        title={messageContent?.title}
        message={messageContent?.message}
        imageUrl={messageContent?.nameImageUrl}
      /> */}

      <div className="wrapper max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex gap-4">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100 transition-colors duration-300 pb-4">
            Quick Starts: Our Impact at a Glance
          </h2>
          <AnimatedStats />
        </div>
        <div className="flex flex-col justify-center items-center pt-4">
          <h2 className="text-2xl font-bold text-center pb-4 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            Our Projects, Events, Reports, and Institutions by Numbers
          </h2>
          <DashboardChart />
        </div>
        <div className="flex flex-col md:flex gap-4 p-2">
          {/* <h2 className="text-2xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100 transition-colors duration-300 p-0">
            Our Latest Facebook Feed
          </h2> */}
          <FacebookPostsCard />
        </div>

        <ReportsSection />
      </div>
    </>
  );
}
