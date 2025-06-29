'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const VIDEOS_PER_PAGE = 2;

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

const VideoResources = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        const data = await response.json();

        console.log('Fetched data:', data);

        if (Array.isArray(data)) {
          setVideos(data);
          setSelectedVideo(data[0] || null);
        } else {
          console.error('Unexpected response format:', data);
          setVideos([]);
          setSelectedVideo(null);
        }
      } catch (error) {
        console.error('Failed to load videos:', error);
        setVideos([]);
        setSelectedVideo(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (isLoading) return <div className="p-5 text-center">Loading videos...</div>;

  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
  const paginatedVideos = videos.slice(startIndex, startIndex + VIDEOS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full p-5 mx-auto">
      {videos.length === 0 ? (
        <p className="text-center">No videos found</p>
      ) : (
        <>
          {selectedVideo && (
            <div className="flex justify-center mb-8 w-full">
              <div className="text-center w-full bg-white rounded-md shadow-md">
                <div className="w-full">
                  <iframe
                    width="100%"
                    height="500"
                    src={`https://www.youtube.com/embed/${selectedVideo.id}`}
                    title={selectedVideo.title || 'No title available'}
                    frameBorder={0}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="rounded-t-md mx-auto"
                  />
                </div>
                <div className="bg-pink-900 text-white p-3 rounded-b-md">
                  <h3 className="text-xl font-bold">
                    {selectedVideo.title || 'No title available'}
                  </h3>
                  <p className="text-sm mt-1">Views: {selectedVideo.viewCount || '0'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="w-full grid grid-cols-2 gap-4 mb-8">
            {paginatedVideos.map((video) => (
              <div
                key={video.id}
                className="relative bg-pink-900 rounded-md shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer w-full"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="w-full h-48 flex items-center justify-center relative">
                  <Image
                    src={video.thumbnail || '/default-thumbnail.jpg'}
                    alt={video.title || 'No title available'}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-md"
                  />
                </div>
                <div className="bg-pink-900 text-white p-2 rounded-b-md">
                  <h2 className="text-sm font-semibold break-words">
                    {video.title || 'No title available'}
                  </h2>
                  <p className="text-xs mt-1">Views: {video.viewCount || '0'}</p>
                </div>
              </div>
            ))}
          </div>

          {videos.length > VIDEOS_PER_PAGE && (
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    currentPage === page
                      ? 'bg-pink-900 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoResources;
