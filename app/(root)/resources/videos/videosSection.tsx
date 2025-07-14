'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cardHoverClass } from '@/utils/styles/card-hover';

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

interface VideosSectionProps {
  setVideoUploader?: (uploader: string | null) => void;
  setVideoUploaderImage?: (image: string | null) => void;
  videos?: Video[];
}

const THUMBNAIL_HEIGHT = 220;
const THUMBNAIL_WIDTH = 320;

// This component displays a video thumbnail with an embedded YouTube player.
// It accepts a video object and an onClick handler to handle video selection.

const VideoThumbnail = ({ video, onClick }: { video: Video; onClick: () => void }) => (
  <div
    onClick={onClick}
    style={{
      width: `${THUMBNAIL_WIDTH}px`,
      height: `${THUMBNAIL_HEIGHT}px`,
      minWidth: '0',
    }}
    className={`rounded-xl overflow-hidden shadow cursor-pointer flex flex-col bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 ${cardHoverClass}`}
  >
    <div style={{ width: '100%', height: '70%' }}>
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${video.id}`}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen={false}
        style={{
          borderTopLeftRadius: '0.75rem',
          borderTopRightRadius: '0.75rem',
          width: '100%',
          height: '100%',
        }}
        title={video.title}
      />
    </div>
    <div
      className="bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-100 font-medium p-2 flex-1 flex items-center"
      style={{ height: '30%' }}
    >
      <p className="text-sm font-medium truncate">{video.title}</p>
    </div>
  </div>
);

const VideoList = ({
  videos,
  onSelect,
  activeId,
  pageSize = 9,
}: {
  videos: Video[];
  onSelect: (id: string) => void;
  activeId?: string;
  pageSize?: number;
}) => {
  const [page, setPage] = useState(0);
  const total = videos.length;
  const pageCount = Math.ceil(total / pageSize);
  const paged = videos.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* gap-3 for reduced padding between videos */}
        {paged.map((video) => (
          <VideoThumbnail key={video.id} video={video} onClick={() => onSelect(video.id)} />
        ))}
      </div>
      {pageCount > 1 && (
        <div className="mt-4 flex gap-2 justify-center items-center">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-2 py-1 rounded border"
          >
            Prev
          </button>
          <span>
            Page {page + 1} of {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
            className="px-2 py-1 rounded border"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const VideoDetails = ({
  videos,
  selectedVideo,
  onBack,
  onSelect,
}: {
  videos: Video[];
  selectedVideo: Video;
  onBack: () => void;
  onSelect: (id: string) => void;
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <button className="mb-4 px-3 py-1 border rounded bg-pink-700 text-white" onClick={onBack}>
        Back to Videos
      </button>
      <div className="mb-4">
        <iframe
          width="100%"
          height="350"
          src={`https://www.youtube.com/embed/${selectedVideo.id}`}
          title={selectedVideo.title}
          className="rounded shadow"
          allowFullScreen
        ></iframe>
      </div>
      <h2 className="text-xl font-bold mb-2">{selectedVideo.title}</h2>
      <div className="mb-2 text-gray-600">{selectedVideo.publishedAt}</div>
      <div className="mb-2">Views: {selectedVideo.viewCount ?? 0}</div>
      <div className="mb-2">Duration: {selectedVideo.duration}</div>
      <div className="mb-2">{selectedVideo.description}</div>
      <div className="mt-6">
        <h3 className="font-semibold mb-2 justify-center text-center">Other Videos</h3>
        <div className="grid grid-cols-2 gap-4">
          {videos
            .filter((v) => v.id !== selectedVideo.id)
            .slice(0, 4)
            .map((video) => (
              <div
                key={video.id}
                className={`border rounded p-2 cursor-pointer hover:border-pink-400 ${cardHoverClass}`}
                onClick={() => onSelect(video.id)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-60 object-cover rounded mb-2"
                />
                <div className="font-medium text-sm truncate">{video.title}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const VideosSection: React.FC<VideosSectionProps> = ({
  setVideoUploader,
  setVideoUploaderImage,
  videos: propVideos,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoIdParam = searchParams.get('video');
  const videoId = videoIdParam || null;

  const [videos, setVideos] = useState<Video[]>(propVideos || []);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (propVideos && propVideos.length > 0) {
      setVideos(propVideos);
      return;
    }
    fetch('/api/videos')
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        if (videoId) {
          const found = data.find((v: Video) => v.id === videoId);
          setSelectedVideo(found || null);
          setVideoUploader?.(null); // update if you have uploader info
          setVideoUploaderImage?.(null);
        } else {
          setSelectedVideo(null);
          setVideoUploader?.(null);
          setVideoUploaderImage?.(null);
        }
      })
      .catch((err) => console.error('Failed to fetch videos:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, propVideos]);

  const handleVideoSelect = (id: string) => {
    const found = videos.find((v) => v.id === id);
    if (!found) return;

    setSelectedVideo(found);

    setVideoUploader?.(null);
    setVideoUploaderImage?.(null);

    const params = new URLSearchParams();
    params.set('video', id);
    params.set('videoTitle', found.title || '');
    router.push(`/resources/videos?${params.toString()}`);
  };

  const handleBack = () => {
    setSelectedVideo(null);
    setVideoUploader?.(null);
    setVideoUploaderImage?.(null);
    router.push(`/resources/videos`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {!selectedVideo ? (
        <VideoList
          videos={videos}
          onSelect={handleVideoSelect}
          activeId={selectedVideo?.id ?? (videoId || undefined)}
          pageSize={9} // 3 columns x 3 rows
        />
      ) : (
        <VideoDetails
          videos={videos}
          selectedVideo={selectedVideo}
          onBack={handleBack}
          onSelect={handleVideoSelect}
        />
      )}
    </div>
  );
};

export default VideosSection;
// This component displays a list of videos with thumbnails and allows selection to view details.
// It handles video selection, displays video details, and allows navigation back to the list.