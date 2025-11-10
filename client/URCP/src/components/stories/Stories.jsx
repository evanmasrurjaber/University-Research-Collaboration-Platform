import React from 'react';
import Navigationbar from '../shared/Navigationbar';
import { Newspaper, Sparkles } from 'lucide-react';

function Stories() {
  return (
    <div className="min-h-screen flex flex-col gap-20">
      <Navigationbar />
      <div>
      <main className="flex-1 px-6 md:px-10 pt-10 pb-14 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-2xl shadow-lg">
              <Newspaper size={48} className="text-white" />
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Research Stories
            </h1>
            <div className="flex items-center justify-center gap-2 text-lg text-gray-600 dark:text-gray-400">
              <Sparkles size={20} className="text-yellow-500" />
              <span className="font-medium">Upcoming Feature</span>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
            Share your research journey, breakthroughs, and insights with the academic community. 
            This feature is currently under development.
          </p>
          
          <div className="mt-4 grid gap-3 text-left max-w-md w-full">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
              <div>
                <div className="font-medium text-sm">Share Research Milestones</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Document your progress and achievements</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
              <div>
                <div className="font-medium text-sm">Connect with Peers</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Engage with researchers worldwide</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2" />
              <div>
                <div className="font-medium text-sm">Inspire Others</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Share insights and learnings</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}

export default Stories;