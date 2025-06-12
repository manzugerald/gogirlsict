'use client';

import { useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';
import '@/assets/styles/custom-swiper.css'; 

interface ProjectImageSliderProps {
  images: string[];
  autoPlay?: boolean;
  delay?: number;
}

export default function ImageSlider({ images, autoPlay = true, delay = 3000 }: ProjectImageSliderProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  return (
    <div className="w-full relative mt-0">
      {/* Main Swiper */}
      <Swiper
        modules={[Navigation, Thumbs, Autoplay, Pagination]}
        navigation
        pagination={{ clickable: true }}
        autoplay={autoPlay ? { delay, disableOnInteraction: false } : false}
        thumbs={{ swiper: thumbsSwiper }}
        className="w-full"
      >
        {images.map((img, idx) => (
          <SwiperSlide key={idx}>
            <img
              src={img}
              alt={`Slide ${idx}`}
              className="w-full h-[40vh] object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnail Swiper */}
      <div className="mt-4">
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={4}
          watchSlidesProgress
          className="rounded-md"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={img}
                alt={`Thumbnail ${idx}`}
                className="w-full h-24 object-cover rounded cursor-pointer"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
