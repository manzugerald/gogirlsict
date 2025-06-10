'use client';

import Image from 'next/image';

const ProjectHero = () => {
  return (
    <div className="w-full h-[25vh] relative mt-0">
      <Image
        src="/assets/images/projects/banner/banner.png"
        alt="Projects Hero"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
};

export default ProjectHero;
