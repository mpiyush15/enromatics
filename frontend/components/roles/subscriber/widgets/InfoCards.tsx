import React from "react";
import Link from "next/link";
import { FaFacebook, FaInstagram } from "react-icons/fa";

type SocialMedia = "facebook" | "instagram";

type InfoCardProps = {
  platform: SocialMedia;
  title: string;
  description: string;
  href: string;
  followers?: number;
  likes?: number;
  comments?: number;
};

export default function InfoCard({
  platform,
  title,
  description,
  href,
  followers,
  likes,
  comments,
}: InfoCardProps) {
  // Select icon based on platform
  const Icon = platform === "facebook" ? FaFacebook : FaInstagram;

  return (
    <Link href={href}>
      <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:shadow-lg transition duration-200 bg-white dark:bg-gray-800 cursor-pointer">
        <div className="flex items-center space-x-3 mb-3">
          <Icon className="text-blue-600 dark:text-blue-400 w-6 h-6" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {title}
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{description}</p>

        <div className="flex space-x-6 text-gray-700 dark:text-gray-300 text-sm font-medium">
          {followers !== undefined && (
            <div>
              <span className="font-bold">{followers.toLocaleString()}</span> Followers
            </div>
          )}
          {likes !== undefined && (
            <div>
              <span className="font-bold">{likes.toLocaleString()}</span> Likes
            </div>
          )}
          {comments !== undefined && (
            <div>
              <span className="font-bold">{comments.toLocaleString()}</span> Comments
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}