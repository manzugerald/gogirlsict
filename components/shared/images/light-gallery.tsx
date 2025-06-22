'use client';

import LightGallery from 'lightgallery/react';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import lgAutoplay from 'lightgallery/plugins/autoplay';
import lgFullscreen from "lightgallery/plugins/fullscreen";
import lgShare from "lightgallery/plugins/share";

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-autoplay.css';
import 'lightgallery/css/lg-fullscreen.css';
import 'lightgallery/css/lg-share.css';

interface LightGalleryGridProps {
  images: string[];
  title?: string;
}

export default function LightGalleryGrid({ images, title = 'Gallery' }: LightGalleryGridProps) {
  return (
    <div className="mt-6">
      <LightGallery
        speed={600}
        plugins={[lgThumbnail, lgZoom, lgAutoplay, lgFullscreen, lgShare]}
        elementClassNames="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        mode="lg-fade"
        thumbnail={true}
        zoomFromOrigin={true}
        download={true}
        counter={true}
        hideBarsDelay={1500}
        selector="a"
        slideShowAutoplay={true}
        slideShowInterval={3000}
        fullScreen={true}
        share={true}
      >
        {images.map((img, idx) => (
          <a
            key={idx}
            href={img}
            className="block cursor-pointer"
            data-lg-size="800-600"
            data-lg-thumb={img}
          >
            <img
              src={img}
              alt={`${title} ${idx + 1}`}
              className="rounded-md object-cover w-full h-28 border-2 border-gray-300 shadow-sm hover:border-blue-600 transition-all duration-200"
              style={{ maxHeight: 110, maxWidth: 180, objectFit: 'cover' }}
            />
          </a>
        ))}
      </LightGallery>
    </div>
  );
}