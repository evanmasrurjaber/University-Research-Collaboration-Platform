import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { PROJECT_API_END_POINT } from "@/utils/constant";
import { useAuth } from "@/context/AuthContext";
import Navigationbar from "../shared/Navigationbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  Users, 
  UserPlus, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Paperclip,
  Clock,
  ChevronRight
} from "lucide-react";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [selectedRole, setSelectedRole] = useState("");
  const [participationStatus, setParticipationStatus] = useState(null);
  // Add a new state for active tab
  const [activeTab, setActiveTab] = useState("details");
  
  useEffect(() => {
    fetchProjectDetails();
  }, [id]);
  
  useEffect(() => {
    if (project && user) {
      // Check if user is already a participant
      const participant = project.participants?.find(
        p => p.user?._id === user._id
      );
      if (participant) {
        setParticipationStatus(participant.status);
      } else {
        setParticipationStatus(null);
      }
    }
  }, [project, user]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${PROJECT_API_END_POINT}/${id}`);
      if (response.data.success) {
        setProject(response.data.project);
      }
    } catch (error) {
      toast.error("Error fetching project details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const response = await axios.put(
        `${PROJECT_API_END_POINT}/${id}`,
        { status },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchProjectDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating project status");
      console.error(error);
    }
  };

  const handleProgressUpdate = async (progress) => {
    try {
      const response = await axios.put(
        `${PROJECT_API_END_POINT}/${id}/progress`,
        { progressPercentage: progress },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchProjectDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating progress");
      console.error(error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    try {
      const response = await axios.post(
        `${PROJECT_API_END_POINT}/${id}/comment`,
        { text: commentText },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setCommentText("");
        toast.success(response.data.message);
        fetchProjectDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding comment");
      console.error(error);
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText[commentId]?.trim()) return;
    
    try {
      const response = await axios.post(
        `${PROJECT_API_END_POINT}/${id}/comment`,
        { 
          text: replyText[commentId],
          parentCommentId: commentId 
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setReplyText({...replyText, [commentId]: ""});
        setShowReplyInput({...showReplyInput, [commentId]: false});
        toast.success(response.data.message);
        fetchProjectDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding reply");
      console.error(error);
    }
  };

  const handleParticipationRequest = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    
    try {
      const response = await axios.post(
        `${PROJECT_API_END_POINT}/${id}/participation`,
        { 
          action: "request",
          role: selectedRole 
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchProjectDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting request");
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isUserAuthorized = () => {
    if (!user || !project) return false;
    
    return (
      project.initiator?._id === user._id ||
      project.mentor?._id === user._id
    );
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "proposed": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "ongoing": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "under_review": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "finished": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getParticipationStatusBadge = (status) => {
    switch (status) {
      case "requested":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Request Pending</Badge>;
      case "invited":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Invitation Received</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Participating</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Request Rejected</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigationbar />
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigationbar />
        <div className="flex justify-center items-center flex-1 flex-col gap-4">
          <AlertCircle className="h-16 w-16 text-red-500" />
          <h2 className="text-xl font-bold">Project not found</h2>
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigationbar />
      
      <div className="max-w-6xl mx-auto mt-28 px-4 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => navigate('/projects')}>Projects</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[300px]">{project.title}</span>
        </div>
        
        {/* Project Header */}
        <div className="rounded-2xl p-6 bg-white dark:bg-black mb-6" style={{ boxShadow: "0 0 20px rgba(34, 42, 53, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 0 6px rgba(34, 42, 53, 0.08), 0 12px 40px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.08) inset" }}>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-2">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusBadgeColor(project.status)} capitalize`}>
                {project.status.replace("_", " ")}
              </Badge>
              {participationStatus && getParticipationStatusBadge(participationStatus)}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags?.map((tag, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created: {formatDate(project.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Updated: {formatDate(project.updatedAt)}</span>
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line">
            {project.description}
          </p>
          
          {/* Project Progress */}
          {(project.status === "approved" || project.status === "ongoing") && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Project Progress</span>
                <span className="text-sm font-medium">{project.progressPercentage || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${project.progressPercentage || 0}%` }}
                ></div>
              </div>
              
              {isUserAuthorized() && (
                <div className="flex justify-end mt-2">
                  <Select onValueChange={(value) => handleProgressUpdate(parseInt(value))}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update progress" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% - Not Started</SelectItem>
                      <SelectItem value="25">25% - Initial Phase</SelectItem>
                      <SelectItem value="50">50% - Halfway</SelectItem>
                      <SelectItem value="75">75% - Advanced</SelectItem>
                      <SelectItem value="100">100% - Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          
          {/* Project Team */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Project Initiator</h3>
              <div className="flex items-center gap-3">
                {project.initiator?.profile?.profilePhotoUrl ? (
                  <img 
                    src={project.initiator.profile.profilePhotoUrl} 
                    alt={project.initiator.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-medium text-blue-800 dark:text-blue-200">
                    {project.initiator?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <div className="font-medium">{project.initiator?.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {project.initiator?.role === "faculty" ? "Faculty" : "Student"}
                  </div>
                </div>
              </div>
            </div>
            
            {project.mentor && (
              <div>
                <h3 className="text-sm font-medium mb-2">Project Mentor</h3>
                <div className="flex items-center gap-3">
                  {project.mentor?.profile?.profilePhotoUrl ? (
                    <img 
                      src={project.mentor.profile.profilePhotoUrl} 
                      alt={project.mentor.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center font-medium text-purple-800 dark:text-purple-200">
                      {project.mentor?.name?.charAt(0) || "M"}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{project.mentor?.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Faculty Mentor
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          {isUserAuthorized() && project.status === "approved" && (
            <div className="mt-6">
              <Button 
                onClick={() => handleStatusChange("ongoing")}
              >
                Start Project
              </Button>
            </div>
          )}
          
          {isUserAuthorized() && project.status === "ongoing" && (
            <div className="mt-6">
              <Button 
                onClick={() => handleStatusChange("finished")}
              >
                Complete Project
              </Button>
            </div>
          )}
        </div>
        
        {/* Faculty Approval Button */}
        {user && 
         user.role === "faculty" && 
         project.status === "proposed" && 
         !project.mentor && 
         project.initiator?._id !== user._id && (
          <div className="mt-6">
            <Button 
              onClick={async () => {
                try {
                  const response = await axios.post(
                    `${PROJECT_API_END_POINT}/${id}/approve-as-mentor`,
                    {},
                    { withCredentials: true }
                  );
                  
                  if (response.data.success) {
                    toast.success("Successfully approved project and assigned as mentor");
                    fetchProjectDetails();
                  }
                } catch (error) {
                  toast.error(error.response?.data?.message || "Error approving project");
                  console.error(error);
                }
              }}
              className="bg-gradient-to-l from-blue-500 to-blue-700 group/btn relative shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:scale-103 hover:shadow-lg hover:from-blue-400 hover:to-blue-600"
            >
              Approve & Become Mentor
              <BottomGradient />
            </Button>
          </div>
        )}
        
        {/* Project Content Tabs */}
        <div className="rounded-2xl bg-white dark:bg-black overflow-hidden mb-8" style={{ boxShadow: "0 0 20px rgba(34, 42, 53, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 0 6px rgba(34, 42, 53, 0.08), 0 12px 40px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.08) inset" }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b border-gray-200 dark:border-gray-800 px-6 py-5">
              <TabsTrigger value="details" className="p-4 rounded-2xl data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
                Details
              </TabsTrigger>
              <TabsTrigger value="team" className="p-4 rounded-2xl data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
                Team
              </TabsTrigger>
              <TabsTrigger value="discussion" className="p-4 rounded-2xl data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
                Discussion
              </TabsTrigger>
              <TabsTrigger value="attachments" className="p-4 rounded-2xl data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
                Attachments
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Department</h3>
                <p className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  {project.department}
                </p>
              </div>
              
              {project.openRoles && project.openRoles.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Open Roles</h3>
                  <div className="space-y-4">
                    {project.openRoles.map((role, index) => (
                      <div 
                        key={index} 
                        className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                      >
                        <h4 className="font-medium">{role.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{role.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Request to Join */}
                  {user && !participationStatus && project.status !== "finished" && (
                    <div className="mt-6 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <h4 className="font-medium mb-3">Request to Join</h4>
                      <div className="flex gap-2">
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            {project.openRoles.map((role, index) => (
                              <SelectItem key={index} value={role.title}>
                                {role.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={handleParticipationRequest}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Request
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="team" className="p-6">
              <h3 className="text-lg font-medium mb-4">Project Participants</h3>
              
              {project.participants && project.participants.length > 0 ? (
                <div className="space-y-4">
                  {project.participants
                    .filter(p => p.status === 'accepted')
                    .map((participant, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {participant.user?.profile?.profilePhotoUrl ? (
                            <img 
                              src={participant.user.profile.profilePhotoUrl} 
                              alt={participant.user.name} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-medium text-gray-600 dark:text-gray-300">
                              {participant.user?.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{participant.user?.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {participant.role}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No team members yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    This project doesn't have any participants yet.
                  </p>
                </div>
              )}
              
              {isUserAuthorized() && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Pending Requests</h3>
                  {project.participants && project.participants.filter(p => p.status === 'requested').length > 0 ? (
                    <div className="space-y-4">
                      {project.participants
                        .filter(p => p.status === 'requested')
                        .map((participant, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {participant.user?.profile?.profilePhotoUrl ? (
                                <img 
                                  src={participant.user.profile.profilePhotoUrl} 
                                  alt={participant.user.name} 
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-medium text-gray-600 dark:text-gray-300">
                                  {participant.user?.name?.charAt(0) || "U"}
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{participant.user?.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Requested: {participant.role}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                                onClick={async () => {
                                  try {
                                    const response = await axios.post(
                                      `${PROJECT_API_END_POINT}/${id}/participation`,
                                      { 
                                        action: "accept",
                                        userId: participant.user._id
                                      },
                                      { withCredentials: true }
                                    );
                                    if (response.data.success) {
                                      toast.success(response.data.message);
                                      fetchProjectDetails();
                                    }
                                  } catch (error) {
                                    toast.error(error.response?.data?.message || "Error accepting request");
                                  }
                                }}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={async () => {
                                  try {
                                    const response = await axios.post(
                                      `${PROJECT_API_END_POINT}/${id}/participation`,
                                      { 
                                        action: "reject",
                                        userId: participant.user._id
                                      },
                                      { withCredentials: true }
                                    );
                                    if (response.data.success) {
                                      toast.success(response.data.message);
                                      fetchProjectDetails();
                                    }
                                  } catch (error) {
                                    toast.error(error.response?.data?.message || "Error rejecting request");
                                  }
                                }}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      No pending requests
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="discussion" className="p-6">
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex gap-3">
                    {user?.profile?.profilePhotoUrl ? (
                      <img 
                        src={user.profile.profilePhotoUrl} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-medium text-blue-800 dark:text-blue-200">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full border border-gray-200 dark:border-gray-800 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-end mt-2">
                        <Button type="submit" disabled={!commentText.trim()}>
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-6 p-4 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                  <p className="mb-2">Sign in to join the discussion</p>
                  <Button onClick={() => navigate('/login')}>
                    Login
                  </Button>
                </div>
              )}
              
              <Separator className="my-6" />
              
              {project.comments && project.comments.length > 0 ? (
                <div className="space-y-6">
                  {project.comments.map((comment) => (
                    <div key={comment._id} className="space-y-4">
                      <div className="flex gap-3">
                        {comment.user?.profile?.profilePhotoUrl ? (
                          <img 
                            src={comment.user.profile.profilePhotoUrl} 
                            alt={comment.user.name} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-medium text-gray-600 dark:text-gray-300">
                            {comment.user?.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{comment.user?.name}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                          </div>
                          <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {comment.text}
                          </p>
                          {user && (
                            <button 
                              className="text-sm text-blue-600 dark:text-blue-400 mt-2 hover:underline"
                              onClick={() => setShowReplyInput({
                                ...showReplyInput, 
                                [comment._id]: !showReplyInput[comment._id]
                              })}
                            >
                              Reply
                            </button>
                          )}
                          
                          {/* Reply input */}
                          {user && showReplyInput[comment._id] && (
                            <div className="mt-3 flex gap-2">
                              <Input 
                                value={replyText[comment._id] || ''}
                                onChange={(e) => setReplyText({
                                  ...replyText,
                                  [comment._id]: e.target.value
                                })}
                                placeholder="Write a reply..."
                              />
                              <Button 
                                onClick={() => handleReplySubmit(comment._id)}
                                disabled={!replyText[comment._id]?.trim()}
                              >
                                Reply
                              </Button>
                            </div>
                          )}
                          
                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 pl-6 space-y-4">
                              {comment.replies.map((reply, index) => (
                                <div key={index} className="flex gap-3">
                                  {reply.user?.profile?.profilePhotoUrl ? (
                                    <img 
                                      src={reply.user.profile.profilePhotoUrl} 
                                      alt={reply.user.name} 
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-medium text-gray-600 dark:text-gray-300">
                                      {reply.user?.name?.charAt(0) || "U"}
                                    </div>
                                  )}
                                  <div>
                                    <div>
                                      <span className="font-medium">{reply.user?.name}</span>
                                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                        {formatDate(reply.createdAt)}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-gray-700 dark:text-gray-300">
                                      {reply.text}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No comments yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="attachments" className="p-6">
              {project.attachments && project.attachments.length > 0 ? (
                <div className="space-y-4">
                  {project.attachments.map((attachment, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-10 w-10 text-blue-500" />
                        <div>
                          <div className="font-medium">{attachment.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Uploaded by {attachment.uploadedBy?.name || "Unknown"} • {formatDate(attachment.uploadedAt)}
                          </div>
                        </div>
                      </div>
                      <a 
                        href={attachment.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Paperclip className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No attachments yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    No files have been uploaded to this project yet.
                  </p>
                </div>
              )}
              
              {user && (participationStatus === "accepted" || isUserAuthorized()) && (
                <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium mb-3">Upload Attachment</h4>
                  <div className="space-y-3">
                    <Input 
                      type="file" 
                      className="cursor-pointer"
                    />
                    <Input 
                      placeholder="Attachment title" 
                    />
                    <div className="flex justify-end">
                      <Button>
                        Upload File
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Bottom gradient effect for buttons
const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

export default ProjectDetails;