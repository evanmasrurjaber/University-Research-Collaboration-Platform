import express from 'express';
import {
    createProject,
    getAllProjects,
    getProjectById,
    updateProjectStatus,
    updateProjectProgress,
    addProjectAttachment,
    manageParticipation,
    addComment,
    getMyProjects,
    getPendingProjects,
    approveAsMentor,
    rejectProjectProposal,
    updateProjectDetails
} from '../controllers/project.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import singleUpload from '../middlewares/multer.js';

const router = express.Router();

// Create a new project proposal
router.route('/create').post(isAuthenticated, createProject);

// Get all projects with filtering
router.route('/all').get(getAllProjects);

// Get projects for current user
router.route('/my').get(isAuthenticated, getMyProjects);

// Get pending projects for faculty approval
router.route('/pending').get(isAuthenticated, getPendingProjects);

// Get, update a specific project
router.route('/:id')
    .get(getProjectById)
    .put(isAuthenticated, updateProjectDetails);

// Approve project and assign faculty as mentor
router.route('/:id/approve-as-mentor').post(isAuthenticated, approveAsMentor);

// Update project progress
router.route('/:id/progress').put(isAuthenticated, updateProjectProgress);

// Add attachment to project
router.route('/:id/attachment').post(isAuthenticated, singleUpload, addProjectAttachment);

// Manage project participation
router.route('/:id/participation').post(isAuthenticated, manageParticipation);

// Add comment to project
router.route('/:id/comment').post(isAuthenticated, addComment);

// Reject project proposal
router.delete('/:id/reject', isAuthenticated, rejectProjectProposal);

export default router;