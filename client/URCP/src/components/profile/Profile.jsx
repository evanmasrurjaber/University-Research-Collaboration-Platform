import React from "react";
import { useAuth } from "@/context/AuthContext.jsx";
import Navigationbar from "@/components/shared/Navigationbar";
import { FaPen } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const photoUrl = user?.profile?.profilePhotoUrl;
  const bio = user?.profile?.bio || "";
  const interests = Array.isArray(user?.profile?.interests)
    ? user.profile.interests.filter(Boolean)
    : [];

  return (
    <div className='h-screen flex flex-col'>
      <Navigationbar />
      <div className="max-w-xl mx-auto mt-28 rounded-2xl p-6 bg-white dark:bg-black" style={{ boxShadow: "0 0 20px rgba(34, 42, 53, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 0 6px rgba(34, 42, 53, 0.08), 0 12px 40px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.08) inset" }}>
        <div className="flex justify-between">
          <h2 className="text-xl font-bold mb-6">Your Profile</h2>
          <Link to="/profile/update"><FaPen className="text-gray-600 dark:text-gray-300" size={12} /></Link>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${user?.name || "User"}'s profile photo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold">
                {(user?.name?.[0] || "?").toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold">{user?.name || "-"}</p>
            <p className="text-sm text-gray-500">{user?.email || "-"}</p>
          </div>
        </div>

        <dl className="divide-y divide-gray-200 dark:divide-gray-800">
          <div className="py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="col-span-2 text-sm">{user?.name || "-"}</dd>
          </div>
          <div className="py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="col-span-2 text-sm">{user?.email || "-"}</dd>
          </div>
          <div className="py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Department</dt>
            <dd className="col-span-2 text-sm">{user?.department || "-"}</dd>
          </div>
          <div className="py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Bio</dt>
            <dd className="col-span-2 text-sm whitespace-pre-line">{bio || "-"}</dd>
          </div>
          <div className="py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">Interests</dt>
            <dd className="col-span-2">
              {interests.length ? (
                <div className="flex flex-wrap gap-2">
                  {interests.map((it, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 shadow-sm border border-gray-200
                                 dark:bg-neutral-900 dark:text-gray-200 dark:border-gray-800"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm">-</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}