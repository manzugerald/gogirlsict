'use client';

import { useEffect, useState, useRef } from 'react';

type FbPost = {
  id: string;
  message?: string;
  createdTime: string;
  permalinkUrl: string;
  fullPicture?: string;
  images?: string[];
};

const POSTS_PER_PAGE = 3;
const AUTO_SCROLL_INTERVAL = 4000; // ms

export default function FacebookPostsCard() {
  const [allPosts, setAllPosts] = useState<FbPost[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/facebook-posts');
        const json = await res.json();
        if (json.data) {
          const withImages = json.data
            .map((p: any) => {
              let image = p.fullPicture;
              if (Array.isArray(p.images) && p.images.length > 0) {
                image = p.images[0];
              }
              if (image && p.message && p.message.trim()) {
                return {
                  id: p.id,
                  message: p.message,
                  createdTime: p.createdTime,
                  permalinkUrl: p.permalinkUrl,
                  fullPicture: image,
                  images: p.images,
                };
              }
              return null;
            })
            .filter(Boolean) as FbPost[];
          setAllPosts(withImages);
          setPage(1);
        } else {
          setError('No posts found.');
        }
      } catch (e: any) {
        setError('Failed to load posts.');
      }
      setLoading(false);
    }
    fetchPosts();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE) || 1;

  useEffect(() => {
    if (!allPosts.length || isHoveringCard) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setPage((prev) => (prev % totalPages) + 1);
    }, AUTO_SCROLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [allPosts, totalPages, isHoveringCard]);

  const onPageChange = (newPage: number) => {
    setPage(newPage);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setPage((prev) => (prev % totalPages) + 1);
    }, AUTO_SCROLL_INTERVAL);
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-10 px-2">
      <div className="flex justify-center">
        <h2 className="text-3xl font-extrabold mb-8 text-center drop-shadow-md dark:text-white">
          Latest Facebook Feed
        </h2>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-2">
          <span className="text-muted-foreground text-xl">Loading...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-medium">{error}</div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl p-0 md:p-6 pt-6 md:pt-8 pb-3 md:pb-4 flex flex-col">
          <div className="overflow-hidden relative flex-1 rounded-3xl">
            <div
              className="flex transition-transform duration-[900ms] ease-in-out"
              style={{
                width: '100%',
                transform: `translateX(-${(page - 1) * 100}%)`,
              }}
            >
              {Array.from({ length: totalPages }).map((_, idx) => {
                const start = idx * POSTS_PER_PAGE;
                let cards = allPosts.slice(start, start + POSTS_PER_PAGE);
                if (cards.length < POSTS_PER_PAGE && allPosts.length > 0) {
                  while (cards.length < POSTS_PER_PAGE) {
                    cards.push(allPosts[0]);
                  }
                }
                return (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-full grid grid-cols-1 md:grid-cols-3 gap-8"
                  >
                    {cards.map((post, i) => (
                      <FbPostCard
                        key={post.id + i}
                        post={post}
                        onHoverStart={() => setIsHoveringCard(true)}
                        onHoverEnd={() => setIsHoveringCard(false)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center pt-6 pb-1">
              <Pagination currentPage={page} totalPages={totalPages} setPage={onPageChange} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FbPostCard({
  post,
  onHoverStart,
  onHoverEnd,
}: {
  post: FbPost;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  // Clamp the message to 100 characters
  const trimmed =
    post.message && post.message.length > 100
      ? post.message.slice(0, 100) + '...'
      : post.message || '';

  return (
    <div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={`
        flex flex-col w-full
        bg-gradient-to-tr from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800
        border border-indigo-200 dark:border-neutral-700
        rounded-3xl shadow-2xl transition-all duration-300 transform
        hover:-translate-y-2 hover:scale-[1.025] hover:shadow-[0_8px_24px_0_rgba(31,38,135,0.21)]
        cursor-pointer group
        overflow-hidden
        min-h-0
      `}
      style={{ minHeight: '0' }}
    >
      <img
        src={post.fullPicture}
        alt="Facebook post"
        className="w-full object-cover rounded-t-3xl group-hover:shadow-lg transition-shadow duration-300"
        style={{ maxHeight: '15rem', minHeight: '15rem' }} // original image height restored
      />
      <div className="flex flex-col p-4 pb-3 flex-1">
        <div className="mb-1 flex flex-col items-center">
          <span className="font-extrabold text-pink-600 dark:text-pink-400 text-base text-center">
            GoGirls ICT Initiative
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 text-center">
            posted on: {formatDate(post.createdTime)}
          </span>
        </div>
        <p className="text-gray-800 dark:text-gray-100 text-sm font-medium drop-shadow-sm mb-4 text-center whitespace-pre-line">
          {trimmed}
        </p>
        <div className="flex justify-center items-end mt-auto">
          <a
            href={post.permalinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-950 font-bold shadow-md transition hover:bg-blue-700 dark:hover:bg-blue-400 hover:scale-105 text-sm"
          >
            Read on Facebook
          </a>
        </div>
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  setPage,
}: {
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
}) {
  const prev = () => setPage(currentPage === 1 ? totalPages : currentPage - 1);
  const next = () => setPage(currentPage === totalPages ? 1 : currentPage + 1);

  const renderPageNumbers = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`mx-1 px-3 py-1 rounded-lg font-semibold transition 
            ${
              i === currentPage
                ? 'bg-blue-600 text-white dark:bg-blue-400 dark:text-gray-900'
                : 'bg-blue-100 dark:bg-neutral-700 text-blue-800 dark:text-blue-200 hover:bg-blue-200 hover:dark:bg-neutral-600'
            }
          `}
          onClick={() => setPage(i)}
          disabled={i === currentPage}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <nav className="flex items-center bg-transparent shadow-none">
      <button
        onClick={prev}
        className="mx-1 px-3 py-1 rounded-lg font-semibold bg-blue-100 dark:bg-neutral-700 text-blue-800 dark:text-blue-200 hover:bg-blue-200 hover:dark:bg-neutral-600 transition"
      >
        Prev
      </button>
      {renderPageNumbers()}
      <button
        onClick={next}
        className="mx-1 px-3 py-1 rounded-lg font-semibold bg-blue-100 dark:bg-neutral-700 text-blue-800 dark:text-blue-200 hover:bg-blue-200 hover:dark:bg-neutral-600 transition"
      >
        Next
      </button>
    </nav>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
// This function formats the date string into a more readable format
// using the browser's locale settings. It returns a string like "Jan 1, 2023, 12:00 AM".