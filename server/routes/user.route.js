import express from 'express';
import {login, register, logout, updateProfile, getTheme, updateTheme, getProfile, getUserProfile,getAllUsers} from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';
import singleUpload from '../middlewares/multer.js';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post((req, res, next) => { console.log('login body:', req.body); next(); });
router.route('/logout').post(isAuthenticated, logout);
router.route('/profile/update').post(isAuthenticated, singleUpload, updateProfile);
router.route('/theme').get(isAuthenticated, getTheme);
router.route('/theme/update').post(isAuthenticated, updateTheme);
router.route('/me').get(isAuthenticated, getProfile);
router.get('/all', getAllUsers);
router.route('/:id').get(getUserProfile);

export default router;