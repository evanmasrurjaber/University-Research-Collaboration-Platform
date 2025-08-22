import express from 'express';
import {login, register, logout, updateProfile, getTheme, updateTheme, getProfile} from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';
import singleUpload from '../middlewares/multer.js';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(isAuthenticated, logout);
router.route('/profile/update').post(isAuthenticated, singleUpload, updateProfile);
router.route('/theme').get(isAuthenticated, getTheme);
router.route('/theme/update').post(isAuthenticated, updateTheme);
router.route('/me').get(isAuthenticated, getProfile);

export default router;