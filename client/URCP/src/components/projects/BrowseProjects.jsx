import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import ProjectCard from "./ProjectCard";
import Navigationbar from "../shared/Navigationbar";
import { PROJECT_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";

function BrowseProjects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    department: "all",
    search: "",
    selectedTag: ""
  });
  
  const [allTags, setAllTags] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  
  useEffect(() => {
    // Only make requests when user data is fully loaded
    if (user) {
      fetchProjects();
      
      // Add a delay to ensure auth tokens are properly set
      if (user.role === "faculty") {
        setTimeout(() => {
          fetchPendingProjects();
        }, 500);
      }
    }
  }, [user]);
  
  useEffect(() => {
    applyFilters();
  }, [projects, filters]);
  
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${PROJECT_API_END_POINT}/all`);
      if (response.data.success) {
        setProjects(response.data.projects);
        
        // Extract all unique tags from projects
        const tagsSet = new Set();
        response.data.projects.forEach(project => {
          if (project.tags && project.tags.length) {
            project.tags.forEach(tag => tagsSet.add(tag));
          }
        });
        setAllTags(Array.from(tagsSet));
      }
    } catch (error) {
      toast.error("Error fetching projects");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPendingProjects = async () => {
    try {
      setLoading(true);
      
      if (!user || user.role !== 'faculty') {
        toast.error("Only faculty members can access this feature");
        return;
      }
      
      console.log("Fetching pending projects as faculty:", user.role);
      
      // Check authentication state in cookies instead of localStorage
      const response = await axios.get(
        `${PROJECT_API_END_POINT}/pending`, 
        { 
          withCredentials: true,
          headers: {
            // Pass cookies and credentials properly
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setPendingProjects(response.data.projects);
      } else {
        console.error("Response indicated failure:", response.data);
        toast.error(response.data.message || "Failed to fetch pending projects");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error fetching pending projects";
      toast.error(errorMessage);
      console.error("Fetch error:", error);
      console.error("Response data:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = [...projects];
    
    if (filters.status && filters.status !== "all") {
      result = result.filter(project => project.status === filters.status);
    }
    
    if (filters.department && filters.department !== "all") {
      result = result.filter(project => project.department === filters.department);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(project => 
        project.title.toLowerCase().includes(searchLower) || 
        project.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.selectedTag) {
      result = result.filter(project => 
        project.tags && project.tags.includes(filters.selectedTag)
      );
    }
    
    setFilteredProjects(result);
  };
  
  const handleSearchChange = (e) => {
    setFilters({...filters, search: e.target.value});
  };
  
  const handleStatusChange = (value) => {
    setFilters({...filters, status: value});
  };
  
  const handleDepartmentChange = (value) => {
    setFilters({...filters, department: value});
  };
  
  const handleTagClick = (tag) => {
    setFilters({...filters, selectedTag: filters.selectedTag === tag ? "" : tag});
  };
  
  const handleCreateProject = () => {
    navigate("/project/new");
  };
  
  const clearFilters = () => {
    setFilters({
      status: "all",
      department: "all",
      search: "",
      selectedTag: ""
    });
  };

  const handleApproveAsMentor = async (projectId) => {
    try {
      const response = await axios.post(
        `${PROJECT_API_END_POINT}/${projectId}/approve-as-mentor`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success("Successfully approved project and assigned as mentor");
        fetchPendingProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error approving project");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigationbar />
      
      <div className="max-w-6xl mx-auto mt-28 px-4 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Research Projects</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Browse and discover research projects across departments
            </p>
          </div>
          
          {user && (
            <Button 
              onClick={handleCreateProject}
              className="mt-4 md:mt-0 bg-gradient-to-l from-blue-500 to-blue-700 group/btn relative shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:scale-103 hover:shadow-lg hover:from-blue-400 hover:to-blue-600"
            >
              Create New Project
              <BottomGradient />
            </Button>
          )}
        </div>
        
        <div className="rounded-2xl p-6 bg-white dark:bg-black mb-8" style={{ boxShadow: "0 0 20px rgba(34, 42, 53, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 0 6px rgba(34, 42, 53, 0.08), 0 12px 40px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.08) inset" }}>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search projects by title or description..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="proposed">Proposed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.department} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Schools and Departments</SelectLabel>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="BRAC Business School">BRAC Business School</SelectItem>
                    <SelectItem value="School of Data and Sciences">School of Data and Sciences</SelectItem>
                    <SelectItem value="BSRM School of Engineering">BSRM School of Engineering</SelectItem>
                    <SelectItem value="School of Law">School of Law</SelectItem>
                    <SelectItem value="School of Pharmacy">School of Pharmacy</SelectItem>
                    <SelectItem value="School of Architecture and Design">School of Architecture and Design</SelectItem>
                    <SelectItem value="School of Humanities and Social Sciences">School of Humanities and Social Sciences</SelectItem>
                    <SelectItem value="School of General Education">School of General Education</SelectItem>
                    <SelectItem value="James P Grant School of Public Health">James P Grant School of Public Health</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                Clear Filters
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger className="p-3" value="all">All Projects</TabsTrigger>
              <TabsTrigger className="p-3" value="tags">By Tags</TabsTrigger>
              {user && user.role === "faculty" && (
                <TabsTrigger className="p-3" value="pending">Pending Approval</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="all">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map(project => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No projects found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters or search terms</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tags">
              <div className="mb-6">
                <h3 className="font-medium mb-3">Filter by Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant={filters.selectedTag === tag ? "default" : "outline"}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1 text-xs"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map(project => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No projects found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Try selecting a different tag</p>
                </div>
              )}
            </TabsContent>

            {user && user.role === "faculty" && (
              <TabsContent value="pending">
                <h3 className="font-medium mb-4">Projects Pending Faculty Approval</h3>
                
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : pendingProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingProjects.map(project => (
                      <div key={project._id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                        <div className="mb-3">
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Proposed by: {project.initiator?.name || "Unknown"}
                          </p>
                          <Badge className="mt-2">{project.department}</Badge>
                          <p className="mt-3 text-sm line-clamp-3">{project.description}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3 mb-4">
                          {project.tags?.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-between mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/project/${project._id}`)}
                          >
                            View Details
                          </Button>
                          
                          {/* Only show approval button if user is faculty AND not the initiator */}
                          {user.role === 'faculty' && user._id !== project.initiator?._id && (
                            <Button 
                              onClick={() => handleApproveAsMentor(project._id)}
                              size="sm"
                              className="bg-gradient-to-l from-blue-500 to-blue-700 group/btn relative shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:scale-103 hover:shadow-lg hover:from-blue-400 hover:to-blue-600"
                            >
                              Approve & Mentor
                              <BottomGradient />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No pending projects</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">There are currently no projects awaiting approval</p>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Bottom gradient effect for buttons as seen in your Signup.jsx
const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

export default BrowseProjects;