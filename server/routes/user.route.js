import express from 'express';
import {login, register, logout, updateProfile, getTheme, updateTheme} from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(isAuthenticated, logout);
router.route('/profile/update').post(isAuthenticated, updateProfile);
router.route('/theme').get(isAuthenticated, getTheme);
router.route('/theme/update').post(isAuthenticated, updateTheme);

export default router;