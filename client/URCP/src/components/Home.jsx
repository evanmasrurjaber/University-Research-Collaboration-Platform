import React, { useEffect, useState } from 'react';
import Navigationbar from './shared/Navigationbar'
import { useNavigate } from 'react-router-dom';
import { PROJECT_API_END_POINT } from '@/utils/constant';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Loader2, ArrowRight, PlusCircle, Bell, UserCircle2, Newspaper } from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecent = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${PROJECT_API_END_POINT}?status=approved`, { withCredentials: true });
      if (res.data?.projects?.length) {
        // take top 3 (assuming backend returns sorted newest first or adjust here)
        setRecent(res.data.projects.slice(0, 3));
      } else {
        setRecent([]);
      }
    } catch {
      setRecent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const QuickAction = ({ icon, label, onClick, accent }) => (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-800 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
    >
      <div className={`h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-br ${accent}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
          {label === 'Browse Projects' && 'Explore active research'}
          {label === 'New Project' && 'Propose or start a study'}
          {label === 'My Profile' && 'View your academic identity'}
          {label === 'Notifications' && 'Stay updated'}
        </span>
      </div>
      <ArrowRight className="ml-auto opacity-40 group-hover:opacity-90 transition" size={18} />
    </button>
  );

  return (
    <div className="min-h-full flex flex-col gap-20">
      <Navigationbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 md:px-10 pt-10 pb-8 max-w-6xl mx-auto">
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl md:text-6xl font-bold tracking-tight">
              Accelerate University Research Collaboration
            </h1>
            <p className="text-2xl font-semibold md:text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              Discover projects, connect with mentors, recruit collaborators, and track progress in one unified academic workspace.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/projects')}
                className="group/btn relative rounded-lg bg-gradient-to-l from-blue-500 to-blue-700 px-5 py-3 text-sm font-medium text-white hover:shadow-lg hover:scale-[1.02] transition"
              >
                Browse Projects
                <BottomGlow />
              </button>
              {user && (
                <button
                  onClick={() => navigate('/project/new')}
                  className="rounded-lg px-5 py-3 text-sm font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Create Project
                </button>
              )}
              {!user && (
                <button
                  onClick={() => navigate('/signup')}
                  className="rounded-lg px-5 py-3 text-sm font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-6 md:px-10 pb-10 max-w-6xl mx-auto">
            <h2 className="text-sm font-semibold mb-4 tracking-wide text-gray-500 dark:text-gray-400">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <QuickAction
                icon={<Newspaper size={20} />}
                label="Browse Projects"
                accent="from-blue-500/20 to-blue-600/30 text-blue-600 dark:text-blue-300"
                onClick={() => navigate('/projects')}
              />
              <QuickAction
                icon={<PlusCircle size={20} />}
                label="New Project"
                accent="from-purple-500/20 to-purple-600/30 text-purple-600 dark:text-purple-300"
                onClick={() => navigate('/project/new')}
              />
              <QuickAction
                icon={<UserCircle2 size={20} />}
                label="People"
                accent="from-emerald-500/20 to-emerald-600/30 text-emerald-600 dark:text-emerald-300"
                onClick={() => navigate('/')}
              />
            </div>
        </section>

        {/* Recent Projects */}
        <section className="px-6 md:px-10 pb-14 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400">Recent Approved Projects</h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {loading && (
              <div className="col-span-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 size={18} className="animate-spin" /> Loading projects...
              </div>
            )}
            {!loading && recent.length === 0 && (
              <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400 border border-dashed rounded-lg p-5">
                No approved projects yet.
              </div>
            )}
            {recent.map(p => (
              <div
                key={p._id}
                onClick={() => navigate(`/project/${p._id}`)}
                className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer flex flex-col gap-2 transition"
              >
                <div className="font-medium line-clamp-1">{p.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {p.description}
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {p.department || 'Department'}
                  </span>
                  {typeof p.progressPercentage === 'number' && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {p.progressPercentage}% progress
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

const BottomGlow = () => (
  <>
    <span className="pointer-events-none absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="pointer-events-none absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

export default Home;