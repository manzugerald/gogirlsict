'use client';

import { useHomePageContent, useExecutiveMessages } from './homePageContentClient';
import CardDogEar from '@/components/shared/cards/cardDogEar';
import MessageCard from '@/components/shared/cards/messageCard';
import { EyeIcon, FocusIcon, HeartIcon, TargetIcon } from 'lucide-react';
import DashboardChart from '../(admin)/admin/dashboard/chart/dashboardChart';
import AnimatedStats from '../(admin)/admin/dashboard/chart/animatedStats';
import HeroVideo from '@/components/shared/heroVideo/heroVideo';
import FacebookPostsCard from '@/components/shared/facebookPostsCard/facebookPostsCard';
import ReportsSection from './resources/reports/reportsSection';

const visionImg = '/assets/images/vision-mission-values/vision.png';
const missionImg = '/assets/images/vision-mission-values/mission.png';
const focusImg = '/assets/images/vision-mission-values/focus.png';
const valuesImg = '/assets/images/vision-mission-values/values.png';

interface HomePageClientProps {
  ssrContent: {
    heroVideo?: string;
    vision?: string;
    mission?: string;
    focus?: string;
    coreValues?: string;
  } | null;
  ssrMessages: {
    id: string;
    name: string;
    title: string;
    affiliated?: string;
    message: string;
    nameImageUrl?: string;
  }[];
}

export default function HomePageClient({ ssrContent, ssrMessages }: HomePageClientProps) {
  // Use hybrid cached hooks with SSR as initialData
  const {
    data: content,
    isLoading: loadingContent,
    refresh: refreshContent,
  } = useHomePageContent(ssrContent);
  const {
    data: executiveMessages,
    isLoading: loadingMessages,
    refresh: refreshMessages,
  } = useExecutiveMessages(ssrMessages);

  if (loadingContent || loadingMessages) return <div>Loading homepage...</div>;
  if (!content) return <div>No Home Page content found</div>;

  return (
    <>
      {content.heroVideo?.trim() && <HeroVideo src={content.heroVideo} />}
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

      <div className="wrapper max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex gap-4">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100 transition-colors duration-300 pb-4">
            Quick Starts: Our Impact at a Glance
          </h2>
          <AnimatedStats />
        </div>
      </div>

      {executiveMessages && executiveMessages.length >= 2 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-row justify-between gap-8">
            <div className="w-1/2">
              <MessageCard
                key={executiveMessages[0].id}
                name={executiveMessages[0].name}
                title={executiveMessages[0].title}
                affiliated={executiveMessages[0].affiliated}
                message={executiveMessages[0].message}
                imageUrl={executiveMessages[0].nameImageUrl}
              />
            </div>
            <div className="w-1/2">
              <MessageCard
                key={executiveMessages[1].id}
                name={executiveMessages[1].name}
                title={executiveMessages[1].title}
                affiliated={executiveMessages[1].affiliated}
                message={executiveMessages[1].message}
                imageUrl={executiveMessages[1].nameImageUrl}
              />
            </div>
          </div>
        </section>
      )}

      <section className="wrapper max-w-7xl mx-auto px-4 py-10">
        <div className="wrapper max-w-7xl mx-auto px-4 pt-10 space-y-6">
          <h2 className="text-2xl font-bold text-center pb-2 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            Our Projects, Events, Reports, and Institutions by Numbers
          </h2>
          <DashboardChart />
        </div>
        <div className="flex flex-col md:flex gap-4 p-2">
          <FacebookPostsCard />
        </div>
        <ReportsSection />
      </section>
    </>
  );
}
