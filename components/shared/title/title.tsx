// components/TitleHeader.tsx

"use client";

import React from "react";

interface TitleHeaderProps {
  title: string;
  authorName: string;
  postDate: string; // e.g., "May 6, 2023"
  authorRole?: string;
  authorImageUrl?: string;
}

export default function TitleHeader({
  title,
  authorName,
  postDate,
  authorRole = "Written by",
  authorImageUrl = "",
}: TitleHeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col md:flex-row w-full rounded-md overflow-hidden shadow-md">
      {/* Left Section: Title */}
      <div className="bg-pink-600 text-white flex-1 p-4 md:p-6">
        <h1 className="text-lg md:text-2xl font-bold leading-snug">{title}</h1>
        <div className="mt-2 h-1 bg-white w-full" />

        {/* GoGirls ICT Initiative */}
        <div className="mt-2 text-gray-900 text-xl font-bold">GoGirls ICT Initiative</div>
      </div>

      {/* Right Section: Author Info */}
      <div className="bg-gradient-to-r from-pink-400 to-rose-800 text-black p-4 md:w-[300px] flex flex-col justify-between">
      <div className="text-xs mb-4">Today's date: {today}</div>

    <div className="flex items-center">
        <div className="w-15 h-15 bg-white rounded-full overflow-hidden flex items-center justify-center text-gray-600">
            {authorImageUrl ? (
            <img
            src={authorImageUrl}
            alt="Author"
            className="w-full h-full object-cover"
            />
            ) : (
            <span className="text-xl">👤</span>
            )}
            </div>
                <div className="ml-3">
                    <div className="text-sm font-semibold">
                        {authorRole} {authorName}
                    </div>
                        <div className="text-xs">
                          Posted: {postDate}
                      </div>
                      <div className="text-xs">
                          Edited: {postDate}
                        </div>
                </div>
            </div>
        </div>
    </div>
  );
}
