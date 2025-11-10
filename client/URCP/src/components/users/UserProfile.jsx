import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigationbar from '../shared/Navigationbar';
import { USER_API_END_POINT } from '@/utils/constant';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronRight, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const statusColor = (s) => {
  switch (s) {
    case 'proposed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'ongoing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'under_review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'finished': return 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: loggedInUser } = useAuth();

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${USER_API_END_POINT}/${id}`);
        if (res.data.success) setData(res.data);
      } catch {
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigationbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigationbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold">User not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const { user, projects } = data;

  const renderProjectList = (list, emptyMsg, editable = false) => {
    if (!list || list.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-lg">
          {emptyMsg}
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {list.map((p) => {
          const canEdit = loggedInUser && (
            p.initiator?._id === loggedInUser._id || 
            p.mentor?._id === loggedInUser._id
          );
          
          console.log('Project:', p.title);
          console.log('Initiator ID:', p.initiator?._id);
          console.log('Mentor ID:', p.mentor?._id);
          console.log('Logged In User ID:', loggedInUser?._id);
          console.log('Can Edit:', canEdit);
          
          return (
            <div
              key={p._id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/project/${p._id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/project/${p._id}`)}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col gap-1 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer relative"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{p.title}</span>
                <div className="flex items-center gap-2">
                  <Badge className={`${statusColor(p.status)} capitalize`}>{p.status.replace('_', ' ')}</Badge>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/project/${p._id}/edit`);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md"
                      title="Edit Project"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-4">
                <span>Created: {formatDate(p.createdAt)}</span>
                {typeof p.progressPercentage === 'number' && (
                  <span>Progress: {p.progressPercentage}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigationbar />
      <div className="max-w-5xl mx-auto mt-28 px-4 w-full">
        <div className="flex items-center gap-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => navigate('/')}>Home</span>
            <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-700 dark:text-gray-300">User Profile</span>
        </div>

        <div
          className="rounded-2xl p-6 bg-white dark:bg-black mb-8"
          style={{ boxShadow: "0 0 20px rgba(34,42,53,.08),0 2px 4px rgba(0,0,0,.06),0 0 0 1px rgba(34,42,53,.05),0 0 6px rgba(34,42,53,.08),0 12px 40px rgba(47,48,55,.05),0 1px 0 rgba(255,255,255,.08) inset" }}
        >
          <div className="flex items-center gap-6">
            {user.profile?.profilePhotoUrl ? (
              <img
                src={user.profile.profilePhotoUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-3xl font-semibold text-blue-700 dark:text-blue-200">
                {user.name?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 capitalize">{user.role}</p>
              {user.department && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{user.department}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Joined {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-xl bg-white dark:bg-black p-4 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Initiated Projects</p>
            <p className="text-2xl font-semibold">{projects.initiated.length}</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-black p-4 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Mentoring</p>
            <p className="text-2xl font-semibold">{projects.mentoring.length}</p>
          </div>
            <div className="rounded-xl bg-white dark:bg-black p-4 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Participating</p>
            <p className="text-2xl font-semibold">{projects.participating.length}</p>
          </div>
        </div>

        <div className="space-y-10 mb-20">
          <section>
            <h2 className="text-lg font-medium mb-4">Initiated Projects</h2>
            {renderProjectList(projects.initiated, "No initiated projects", true)}
          </section>
          <section>
            <h2 className="text-lg font-medium mb-4">Mentoring</h2>
            {renderProjectList(projects.mentoring, "Not mentoring any project")}
          </section>
          <section>
            <h2 className="text-lg font-medium mb-4">Participating</h2>
            {renderProjectList(projects.participating, "No participation records")}
          </section>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;