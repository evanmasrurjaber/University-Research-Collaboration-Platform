import React from "react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

function ProjectCard({ project }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/project/${project._id}`);
  };

  return (
    <div 
      className="rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg line-clamp-2">{project.title}</h3>
          <Badge 
            className={`${
              project.status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
              project.status === "proposed" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
              project.status === "ongoing" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
              project.status === "under_review" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" :
              "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            } hover:bg-opacity-80 capitalize`}
          >
            {project.status.replace("_", " ")}
          </Badge>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-3">
          {project.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {project.initiator?.profile?.profilePhotoUrl ? (
              <img 
                src={project.initiator.profile.profilePhotoUrl} 
                alt={project.initiator.name} 
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs text-blue-800 dark:text-blue-200">
                {project.initiator?.name?.charAt(0) || "U"}
              </div>
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {project.initiator?.name || "Unknown"}
            </span>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {project.department?.split(" ").slice(0, 2).join(" ")}
          </div>
        </div>
        
        {project.tags && project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectCard;