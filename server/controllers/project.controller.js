import projectModel from '../models/projectModel.js';
import userModel from '../models/userModel.js';
import getDataUri from '../utils/dataUri.js';
import cloudinary from '../utils/cloudinary.js';
import { createNotification } from './notification.controller.js';

// Create a new project proposal
export const createProject = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, department, openRoles, tags } = req.body;
        
        // Validate required fields
        if (!title || !description || !department) {
            return res.status(400).json({ 
                success: false, 
                message: "Title, description and department are required" 
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Parse open roles if provided as string
        let roles = openRoles;
        if (typeof openRoles === 'string') {
            try {
                roles = JSON.parse(openRoles);
            } catch (e) {
                roles = [];
            }
        }

        // Parse tags if provided as string
        let projectTags = tags;
        if (typeof tags === 'string') {
            try {
                projectTags = JSON.parse(tags);
            } catch (e) {
                projectTags = [];
            }
        }

        // Set initial status based on user role
        const initialStatus = user.role === 'faculty' ? 'approved' : 'proposed';
        
        // Create new project
        const project = new projectModel({
            title,
            description,
            department,
            status: initialStatus,
            initiator: userId,
            openRoles: roles || [],
            tags: projectTags || []
        });

        // If user is faculty, automatically assign them as mentor
        if (user.role === 'faculty') {
            project.mentor = userId;
        }

        await project.save();

        return res.status(201).json({
            success: true,
            message: user.role === 'faculty' 
                ? "Project created successfully" 
                : "Project proposal submitted for review",
            project
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get all projects with optional filters
export const getAllProjects = async (req, res) => {
    try {
        const { status, department, mentor, search, tags } = req.query;
        
        // Build query object
        const query = {};
        
        if (status) query.status = status;
        if (department) query.department = department;
        if (mentor) query.mentor = mentor;
        if (tags) {
            const tagArray = tags.split(',');
            query.tags = { $in: tagArray };
        }
        
        // Add search functionality
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Fetch projects with populated fields
        const projects = await projectModel.find(query)
            .populate('initiator', 'name email role department profile.profilePhotoUrl')
            .populate('mentor', 'name email role department profile.profilePhotoUrl')
            .populate('participants.user', 'name email role department profile.profilePhotoUrl')
            .sort({ createdAt: -1 });
            
        return res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single project by ID
export const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const project = await projectModel.findById(id)
            .populate('initiator', 'name email role department profile.profilePhotoUrl')
            .populate('mentor', 'name email role department profile.profilePhotoUrl')
            .populate('participants.user', 'name email role department profile.profilePhotoUrl')
            .populate('comments.user', 'name email role profile.profilePhotoUrl')
            .populate('comments.replies.user', 'name email role profile.profilePhotoUrl')
            .populate('reviews.user', 'name email role profile.profilePhotoUrl')
            .populate('attachments.uploadedBy', 'name email');
            
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        
        return res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update project status (for faculty/admin to approve proposals)
export const updateProjectStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Only faculty can update status
        if (user.role !== 'faculty') {
            return res.status(403).json({ 
                success: false, 
                message: "Only faculty members can approve or update project status" 
            });
        }
        
        const project = await projectModel.findById(id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        
        // Check if user is the mentor or initiator if it's a faculty
        const isMentor = project.mentor && project.mentor.toString() === userId;
        const isInitiator = project.initiator.toString() === userId;
        
        if (!isMentor && !isInitiator) {
            // If not mentor yet, faculty can assign themselves as mentor when approving
            if (status === 'approved' && project.status === 'proposed' && !project.mentor) {
                project.mentor = userId;
            } else {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to update this project's status"
                });
            }
        }
        
        // Add notification when project is approved
        if (status === 'approved' && project.status !== 'approved') {
            // Notify the initiator that their project was approved
            await createNotification(
                project.initiator.toString(),
                'project_approved',
                `Your project "${project.title}" has been approved!`,
                project._id,
                userId
            );
        }
        
        // Add notification when project is completed
        if (status === 'finished' && project.status !== 'finished') {
            // Get all participants
            const participantIds = project.participants
                .filter(p => p.status === 'accepted')
                .map(p => p.user.toString());
                
            // Create notifications for all participants
            for (const participantId of participantIds) {
                if (participantId !== userId) { // Don't notify the user making the update
                    await createNotification(
                        participantId,
                        'project_completed',
                        `The project "${project.title}" has been marked as completed!`,
                        project._id,
                        userId
                    );
                }
            }
        }
        
        project.status = status;
        await project.save();
        
        return res.status(200).json({
            success: true,
            message: `Project status updated to ${status}`,
            project
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update project progress
export const updateProjectProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { progressPercentage } = req.body;
        const userId = req.user.id;
        
        if (progressPercentage < 0 || progressPercentage > 100) {
            return res.status(400).json({
                success: false,
                message: "Progress percentage must be between 0 and 100"
            });
        }
        
        const project = await projectModel.findById(id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        
        // Check if user has permission (initiator or mentor)
        if (project.initiator.toString() !== userId && 
            (!project.mentor || project.mentor.toString() !== userId)) {
            return res.status(403).json({
                success: false,
                message: "Only project initiator or mentor can update progress"
            });
        }
        
        project.progressPercentage = progressPercentage;
        await project.save();
        
        return res.status(200).json({
            success: true,
            message: "Project progress updated",
            progressPercentage
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Add attachment to project
export const addProjectAttachment = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const userId = req.user.id;
        const file = req.file;
        
        if (!file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        
        if (!title) {
            return res.status(400).json({ success: false, message: "Attachment title is required" });
        }
        
        const project = await projectModel.findById(id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        
        // Check if user is participant, initiator or mentor
        const isInitiator = project.initiator.toString() === userId;
        const isMentor = project.mentor && project.mentor.toString() === userId;
        const isParticipant = project.participants.some(
            p => p.user.toString() === userId && p.status === 'accepted'
        );
        
        if (!isInitiator && !isMentor && !isParticipant) {
            return res.status(403).json({
                success: false,
                message: "Only project members can add attachments"
            });
        }
        
        // Upload file to cloudinary
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
            folder: 'project-attachments'
        });
        
        // Add attachment to project
        project.attachments.push({
            title,
            fileUrl: cloudResponse.secure_url,
            filePublicId: cloudResponse.public_id,
            uploadedBy: userId
        });
        
        await project.save();
        
        return res.status(200).json({
            success: true,
            message: "Attachment added successfully",
            attachment: project.attachments[project.attachments.length - 1]
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Manage project participation (request, invite, accept, reject roles)
export const manageParticipation = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, userId: targetUserId, role } = req.body;
        const currentUserId = req.user.id;
        
        const project = await projectModel.findById(id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        
        const targetUser = await userModel.findById(targetUserId || currentUserId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "Target user not found" });
        }
        
        // Different actions based on the request
        switch (action) {
            case 'request': {
                // User requesting to join
                if (!role) {
                    return res.status(400).json({ success: false, message: "Role is required" });
                }
                
                // Check if user already has a participation record
                const existingParticipant = project.participants.find(
                    p => p.user.toString() === currentUserId
                );
                
                if (existingParticipant) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "You already have a pending or accepted role in this project" 
                    });
                }
                
                // Add user's request
                project.participants.push({
                    user: currentUserId,
                    role,
                    status: 'requested'
                });
                
                await project.save();
                
                // Add notification for project initiator and mentor
                const notifyIds = [project.initiator.toString()];
                if (project.mentor) {
                    notifyIds.push(project.mentor.toString());
                }
                
                // Remove duplicates in case initiator is also mentor
                const uniqueNotifyIds = [...new Set(notifyIds)];
                
                for (const notifyId of uniqueNotifyIds) {
                    if (notifyId !== currentUserId) { // Don't notify the requester
                        await createNotification(
                            notifyId,
                            'new_role_request',
                            `${targetUser.name} has requested to join your project "${project.title}" as ${role}`,
                            project._id,
                            currentUserId
                        );
                    }
                }
                
                return res.status(200).json({
                    success: true,
                    message: "Role request submitted successfully"
                });
            }
            
            case 'invite': {
                // Project owner/mentor inviting a user
                const isInitiator = project.initiator.toString() === currentUserId;
                const isMentor = project.mentor && project.mentor.toString() === currentUserId;
                
                if (!isInitiator && !isMentor) {
                    return res.status(403).json({
                        success: false,
                        message: "Only project initiator or mentor can send invitations"
                    });
                }
                
                if (!role || !targetUserId) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "Both role and target user ID are required" 
                    });
                }
                
                // Check if user already has a participation record
                const existingParticipant = project.participants.find(
                    p => p.user.toString() === targetUserId
                );
                
                if (existingParticipant) {
                    return res.status(400).json({
                        success: false,
                        message: "User already has a pending or accepted role in this project"
                    });
                }
                
                // Add invitation
                project.participants.push({
                    user: targetUserId,
                    role,
                    status: 'invited'
                });
                
                await project.save();
                return res.status(200).json({
                    success: true,
                    message: "Invitation sent successfully"
                });
            }
            
            case 'accept': {
                // Accepting an invitation or request
                const isInitiator = project.initiator.toString() === currentUserId;
                const isMentor = project.mentor && project.mentor.toString() === currentUserId;
                
                // Find participant record
                const participantIndex = project.participants.findIndex(
                    p => p.user.toString() === (isInitiator || isMentor ? targetUserId : currentUserId)
                );
                
                if (participantIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        message: "No pending invitation or request found"
                    });
                }
                
                const participant = project.participants[participantIndex];
                
                // Check permissions
                if ((participant.status === 'requested' && !isInitiator && !isMentor) || 
                    (participant.status === 'invited' && currentUserId !== participant.user.toString())) {
                    return res.status(403).json({
                        success: false,
                        message: "You don't have permission to accept this"
                    });
                }
                
                // Update status to accepted
                project.participants[participantIndex].status = 'accepted';
                
                // Determine who is being notified
                const notifyUserId = (isInitiator || isMentor) ? targetUserId : currentUserId;
                const notifierUserId = (isInitiator || isMentor) ? currentUserId : participant.user;
                
                // Create notification for user whose request was accepted
                await createNotification(
                    notifyUserId,
                    'role_request_approved',
                    participant.status === 'invited' 
                        ? `You accepted the invitation to join "${project.title}" as ${participant.role}`
                        : `Your request to join "${project.title}" as ${participant.role} has been approved`,
                    project._id,
                    notifierUserId
                );
                
                await project.save();
                
                return res.status(200).json({
                    success: true,
                    message: participant.status === 'invited' 
                        ? "Invitation accepted successfully"
                        : "Request approved successfully"
                });
            }
            
            case 'reject': {
                // Rejecting an invitation or request
                const isInitiator = project.initiator.toString() === currentUserId;
                const isMentor = project.mentor && project.mentor.toString() === currentUserId;
                
                // Find participant record
                const participantIndex = project.participants.findIndex(
                    p => p.user.toString() === (isInitiator || isMentor ? targetUserId : currentUserId)
                );
                
                if (participantIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        message: "No pending invitation or request found"
                    });
                }
                
                const participant = project.participants[participantIndex];
                
                // Check permissions
                if ((participant.status === 'requested' && !isInitiator && !isMentor) || 
                    (participant.status === 'invited' && currentUserId !== participant.user.toString())) {
                    return res.status(403).json({
                        success: false,
                        message: "You don't have permission to reject this"
                    });
                }
                
                // Update status to rejected or remove
                project.participants[participantIndex].status = 'rejected';
                
                // Determine who is being notified
                const notifyUserId = (isInitiator || isMentor) ? targetUserId : currentUserId;
                const notifierUserId = (isInitiator || isMentor) ? currentUserId : participant.user;
                
                // Create notification for user whose request was rejected
                if (participant.status === 'requested') {
                    await createNotification(
                        notifyUserId,
                        'role_request_rejected',
                        `Your request to join "${project.title}" as ${participant.role} has been declined`,
                        project._id,
                        notifierUserId
                    );
                }
                
                await project.save();
                
                return res.status(200).json({
                    success: true,
                    message: participant.status === 'invited' 
                        ? "Invitation rejected successfully"
                        : "Request rejected successfully"
                });
            }
            
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid action. Must be 'request', 'invite', 'accept', or 'reject'"
                });
        }
        
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Add comment to project
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, parentCommentId } = req.body;
        const userId = req.user.id;
        
        if (!text) {
            return res.status(400).json({ success: false, message: "Comment text is required" });
        }
        
        const project = await projectModel.findById(id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        
        // Add a new comment or reply to an existing comment
        if (parentCommentId) {
            // This is a reply to a comment
            const commentIndex = project.comments.findIndex(
                c => c._id.toString() === parentCommentId
            );
            
            if (commentIndex === -1) {
                return res.status(404).json({ success: false, message: "Parent comment not found" });
            }
            
            // Add reply
            project.comments[commentIndex].replies.push({
                user: userId,
                text,
                createdAt: new Date()
            });
            
            // Notify the original commenter
            const parentComment = project.comments.find(c => c._id.toString() === parentCommentId);
            if (parentComment && parentComment.user.toString() !== userId) {
                await createNotification(
                    parentComment.user.toString(),
                    'new_reply',
                    `Someone replied to your comment on "${project.title}"`,
                    project._id,
                    userId
                );
            }
        } else {
            // This is a new top-level comment
            project.comments.push({
                user: userId,
                text,
                createdAt: new Date(),
                replies: []
            });
            
            // Notify project initiator and mentor
            const notifyIds = [project.initiator.toString()];
            if (project.mentor) {
                notifyIds.push(project.mentor.toString());
            }
            
            // Remove duplicates and don't notify the commenter
            const uniqueNotifyIds = [...new Set(notifyIds)].filter(id => id !== userId);
            
            for (const notifyId of uniqueNotifyIds) {
                await createNotification(
                    notifyId,
                    'new_comment',
                    `Someone commented on your project "${project.title}"`,
                    project._id,
                    userId
                );
            }
        }
        
        await project.save();
        
        // Fetch updated project with populated user fields
        const updatedProject = await projectModel.findById(id)
            .populate('comments.user', 'name email role profile.profilePhotoUrl')
            .populate('comments.replies.user', 'name email role profile.profilePhotoUrl');
            
        return res.status(200).json({
            success: true,
            message: parentCommentId ? "Reply added successfully" : "Comment added successfully",
            comments: updatedProject.comments
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get projects for current user
export const getMyProjects = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get projects where user is initiator, mentor or participant
        const projects = await projectModel.find({
            $or: [
                { initiator: userId },
                { mentor: userId },
                { 'participants.user': userId }
            ]
        })
        .populate('initiator', 'name email role department profile.profilePhotoUrl')
        .populate('mentor', 'name email role department profile.profilePhotoUrl')
        .sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get pending projects (for faculty)
export const getPendingProjects = async (req, res) => {
  try {
    // First check if user is authenticated at all
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to view pending projects"
      });
    }
    
    // Get full user data from database to ensure we have the role
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if user is faculty
    if (user.role !== "faculty") {
      return res.status(403).json({
        success: false,
        message: `Only faculty members can view pending projects. Your role: ${user.role}`
      });
    }

    // Get pending projects
    const projects = await projectModel.find({
      status: "proposed",
      $or: [
        { mentor: { $exists: false } },
        { mentor: null }
      ]
    }).populate("initiator", "name role profile");

    return res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    console.error("Pending projects error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching pending projects"
    });
  }
};

// Approve project as mentor (faculty only)
export const approveAsMentor = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get full user data from database
        const user = await userModel.findById(req.user.id);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found"
          });
        }
        
        // Only faculty members can approve projects
        if (user.role !== "faculty") {
            return res.status(403).json({
                success: false,
                message: "Only faculty members can approve projects as mentors"
            });
        }

        // Find and update the project
        const project = await projectModel.findById(id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }
        
        if (project.status !== "proposed") {
            return res.status(400).json({
                success: false,
                message: "Only proposed projects can be approved"
            });
        }
        
        if (project.mentor) {
            return res.status(400).json({
                success: false,
                message: "This project already has a mentor"
            });
        }
        
        // Update project status and assign mentor
        project.status = "approved";
        project.mentor = req.user.id;
        await project.save();
        
        // Notify the project initiator
        await createNotification(
            project.initiator.toString(),
            'project_approved',
            `Your project "${project.title}" has been approved and has a mentor assigned!`,
            project._id,
            req.user.id
        );
        
        return res.status(200).json({
            success: true,
            message: "Project approved successfully and you are now the mentor"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while approving project"
        });
    }
};