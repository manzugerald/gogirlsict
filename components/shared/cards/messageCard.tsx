import React from 'react';
import clsx from 'clsx';
import { cardHoverClass } from '@/utils/styles/card-hover';

interface MessageCardProps {
  name: string;
  title: string;
  affiliated?: string;
  message: string;
  imageUrl?: string;
}

const MessageCard: React.FC<MessageCardProps> = ({
  name,
  title,
  affiliated,
  message,
  imageUrl,
}) => {
  return (
    <div
      className={clsx(
        'w-full h-full flex flex-col bg-white dark:bg-neutral-900 rounded-xl shadow-md transition-transform duration-300 transform-gpu hover:scale-105 hover:-rotate-x-2 hover:rotate-y-2 hover:shadow-2xl',
        cardHoverClass
      )}
      style={{
        perspective: '900px', // Enables 3D for children
      }}
    >
      {/* First div: pink header with image/identity */}
      <div className="flex items-center bg-pink-800 dark:bg-pink-900 rounded-t-xl px-6 py-4">
        {/* Image on the left */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-16 h-16 object-cover rounded-full border-2 border-white dark:border-pink-700"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-white dark:border-pink-700 flex items-center justify-center text-gray-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </div>
        )}

        {/* Name, title, affiliation to the right of image */}
        <div className="ml-4 flex flex-col">
          <span className="text-lg font-bold text-white">{title}</span>
          <span className="block font-semibold text-gray-400 dark:text-gray-200 mb-2">{name}</span>
          {affiliated && <span className="text-xs text-pink-100 mt-1">{affiliated}</span>}
        </div>
      </div>

      {/* Second div: message content */}
      <div className="px-6 pb-5 pt-4 flex-1 flex flex-col">
        <p className="text-justify text-gray-900 dark:text-gray-200 flex-1">{message}</p>
      </div>
    </div>
  );
};

export default MessageCard;
// This component renders a message card with a header containing an image and text, and a body for the message.
// It uses Tailwind CSS for styling and supports dark mode. The card has a hover effect that scales and rotates it slightly for a 3D effect.