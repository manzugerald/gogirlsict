'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '@/assets/styles/video-style.css';
import { cardHoverClass } from '@/utils/styles/card-hover';
import clsx from 'clsx';

type Video = {
  id: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  publishedAt?: string;
  viewCount?: string | number;
  likeCount?: string | number;
  duration?: string;
};

const THUMBNAIL_HEIGHT = 250;
const THUMBS_PER_ROW = 3;
const ROWS = 2;
const THUMBS_PER_PAGE = THUMBS_PER_ROW * ROWS;

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const truncate = (str: string, max: number) =>
  str && str.length > max ? str.slice(0, max) + '...' : str;

type VideosSectionProps = {
  videos?: Video[]; // Videos can be passed as prop
};

const VideosSection = ({ videos: propVideos }: VideosSectionProps) => {
  const [videos, setVideos] = useState<Video[]>(propVideos || []);
  const [mainIndex, setMainIndex] = useState(0);
  const [thumbPage, setThumbPage] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const mainVideoRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlVideoId = searchParams.get('video');

  // Only fetch if videos prop not provided
  useEffect(() => {
    if (propVideos && propVideos.length > 0) {
      setVideos(propVideos);
      return;
    }
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setVideos(data);
        }
      } catch (error) {
        console.error('Failed to fetch videos', error);
        setVideos([]);
      }
    };
    fetchVideos();
  }, [propVideos]);

  // Set mainIndex based on urlVideoId
  useEffect(() => {
    if (videos.length === 0) return;

    if (urlVideoId) {
      const idx = videos.findIndex((v) => v.id === urlVideoId);
      if (idx !== -1) {
        setMainIndex(idx);
        return;
      }
    }
    setMainIndex(0);
  }, [videos, urlVideoId]);

  useEffect(() => {
    setThumbPage(0);
  }, [mainIndex, videos.length]);

  // ---- YouTube IFrame API integration ----
  const loadYouTubeAPI = useCallback(() => {
    if (window.YT && window.YT.Player) {
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }, []);

  // --- URL Update Logic ---
  const updateUrlWithVideo = (videoId: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('video', videoId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    loadYouTubeAPI();

    window.onYouTubeIframeAPIReady = () => {
      if (!videos[mainIndex]) return;
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
      }
      ytPlayerRef.current = new window.YT.Player('main-video-iframe', {
        videoId: videos[mainIndex].id,
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setShowRecommendations(false);
              setMainIndex((prev) => {
                if (prev < videos.length - 1) {
                  updateUrlWithVideo(videos[prev + 1].id);
                  return prev + 1;
                } else {
                  updateUrlWithVideo(videos[0].id);
                  return 0;
                }
              });
            }
          },
          onReady: () => {
            setShowRecommendations(false);
          },
        },
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
      });
    };

    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }
    return () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
    };
    // mainIndex, videos, updateUrlWithVideo, loadYouTubeAPI are dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainIndex, videos, loadYouTubeAPI]);

  useEffect(() => {
    setShowRecommendations(false);
  }, [mainIndex]);

  const selectedVideo = videos[mainIndex];
  const thumbnailIndex = (mainIndex + 1) % videos.length;
  const thumbnailVideo = videos.length > 1 ? videos[thumbnailIndex] : null;

  const belowThumbnails = videos
    .map((v, i) => ({ video: v, idx: i }))
    .filter(({ idx }) => idx !== mainIndex && idx !== thumbnailIndex);

  const totalThumbPages = Math.ceil(belowThumbnails.length / THUMBS_PER_PAGE);

  useEffect(() => {
    if (thumbPage >= totalThumbPages && totalThumbPages > 0) {
      setThumbPage(totalThumbPages - 1);
    }
  }, [thumbPage, totalThumbPages]);

  const pagedBelowThumbnails = belowThumbnails.slice(
    thumbPage * THUMBS_PER_PAGE,
    thumbPage * THUMBS_PER_PAGE + THUMBS_PER_PAGE
  );

  const getRows = () => {
    const rows: { video: Video; idx: number }[][] = [];
    for (let i = 0; i < ROWS; i++) {
      const start = i * THUMBS_PER_ROW;
      const end = start + THUMBS_PER_ROW;
      const row = pagedBelowThumbnails.slice(start, end);
      if (row.length > 0) rows.push(row);
    }
    return rows;
  };

  const handleRightThumbClick = () => {
    updateUrlWithVideo(videos[thumbnailIndex].id);
    setTimeout(() => {
      if (mainVideoRef.current) {
        mainVideoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 0);
  };

  const handleBelowThumbClick = (idx: number) => {
    updateUrlWithVideo(videos[idx].id);
    setTimeout(() => {
      if (mainVideoRef.current) {
        mainVideoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 0);
  };

  const handleRecommendationClick = (videoId: string) => {
    setShowRecommendations(false);
    updateUrlWithVideo(videoId);
    setTimeout(() => {
      if (mainVideoRef.current) {
        mainVideoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 0);
  };

  const goPrevThumbPage = () => setThumbPage((p) => (p === 0 ? totalThumbPages - 1 : p - 1));
  const goNextThumbPage = () => setThumbPage((p) => (p >= totalThumbPages - 1 ? 0 : p + 1));

  if (!videos.length) return <div className="p-5 text-center">Loading videos...</div>;

  // Related videos logic for overlay and below player
  const relatedVideos = videos.filter((v, i) => i !== mainIndex).slice(0, 6);

  return (
    <div>
      {/* Main video row */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Main Video ... if thumbnail is on the right, set md:w-2/3*/}
        <div className="w-full" style={{ position: 'relative' }}>
          <div
            ref={mainVideoRef}
            className="main-video-container shadow rounded-xl overflow-hidden bg-black"
            style={{
              minHeight: THUMBNAIL_HEIGHT * 1.72,
              height: THUMBNAIL_HEIGHT * 1.72,
              maxHeight: THUMBNAIL_HEIGHT * 1.72,
              position: 'relative',
            }}
          >
            {/* IFrame API replaces this div */}
            <div
              id="main-video-iframe"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '0.75rem',
                overflow: 'hidden',
              }}
            />
            {/* Overlay recommendations only when showRecommendations is true */}
            {showRecommendations && (
              <div
                className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-20"
                style={{ borderRadius: '0.75rem' }}
              >
                <h2 className="text-white text-xl font-bold mb-4">Related Videos</h2>
                <div className="flex flex-wrap gap-4 justify-center">
                  {relatedVideos.map((video) => (
                    <div
                      key={video.id}
                      className="bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer w-44 p-3 flex flex-col items-center"
                      onClick={() => handleRecommendationClick(video.id)}
                    >
                      {video.thumbnail && (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="rounded-lg mb-2 w-full h-20 object-cover"
                        />
                      )}
                      <div className="text-white text-sm font-semibold text-center mb-1">
                        {truncate(video.title || '', 18)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="main-video-overlay">
              <div className="main-video-title">{selectedVideo.title}</div>
              <div className="main-video-views">Views: {selectedVideo.viewCount ?? '0'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2 rows of thumbnails below, paginated 3 per row, pagination below last row */}
      {belowThumbnails.length > 0 && (
        <div>
          <div className="w-full flex flex-col gap-4 items-center">
            {getRows().map((row, rowIdx) => (
              <div key={rowIdx} className="flex flex-row gap-4 justify-center w-full">
                {row.map(({ video, idx }) => (
                  <div
                    key={video.id}
                    className={clsx(
                      'rounded-xl overflow-hidden shadow cursor-pointer flex flex-col bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700',
                      cardHoverClass
                    )}
                    onClick={() => handleBelowThumbClick(idx)}
                    style={{ width: '400px', height: `${THUMBNAIL_HEIGHT}px`, minWidth: '0' }}
                  >
                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        style={{
                          borderTopLeftRadius: '0.75rem',
                          borderTopRightRadius: '0.75rem',
                          height: '70%',
                        }}
                      />
                    )}
                    <div
                      className="bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-100 font-medium p-2 flex-1 flex items-center"
                      style={{ height: '30%' }}
                    >
                      <p className="text-sm font-medium truncate">{video.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* Pagination controls always just below the last actual row */}
          {totalThumbPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-2">
              <button
                onClick={goPrevThumbPage}
                className="px-3 py-1 rounded bg-pink-800 text-white"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {thumbPage + 1} of {totalThumbPages}
              </span>
              <button
                onClick={goNextThumbPage}
                className="px-3 py-1 rounded bg-pink-800 text-white"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideosSection;
