import React from "react";
import { Link } from "react-router-dom";

export default function PeopleCard({ user }) {
  const photo = user?.profile?.profilePhotoUrl;
  const interests = Array.isArray(user?.profile?.interests) ? user.profile.interests.slice(0, 4) : [];
  return (
    <Link to={`/users/${user._id}`} className="block group">
      <div className="p-4 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:shadow-lg transition">
        <div className="flex items-center gap-4">
          {photo ? (
            <img src={photo} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-semibold text-blue-700 dark:text-blue-200">
              {user.name?.charAt(0) || "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium truncate">{user.name}</h3>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user.role}</div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{user.department || "-"}</p>
          </div>
        </div>

        {user.profile?.bio && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 line-clamp-2">{user.profile.bio}</p>
        )}

        {interests.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {interests.map((it, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-neutral-900 dark:text-gray-200 border border-gray-200 dark:border-gray-800">
                {it}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}