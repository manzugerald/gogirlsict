'use client';

import LightGallery from 'lightgallery/react';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import lgAutoplay from 'lightgallery/plugins/autoplay';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-autoplay.css';

interface LightGalleryGridProps {
  images: string[];
  title?: string;
}

export default function LightGalleryGrid({ images, title = 'Gallery' }: LightGalleryGridProps) {
  return (
    <div className="mt-6">
      <LightGallery
        speed={500}
        plugins={[lgThumbnail, lgZoom, lgAutoplay]}
        autoplay={true}
        autoplayControls={true}
        elementClassNames="grid grid-cols-2 gap-4"
      >
        {images.map((img, idx) => (
          <a
            key={idx}
            href={img}
            className="block cursor-pointer"
            data-lg-size="1600-1067"
          >
            <img
              src={img}
              alt={`${title} ${idx + 1}`}
              className="rounded-md object-cover w-full h-48"
            />
          </a>
        ))}
      </LightGallery>
    </div>
  );
}
