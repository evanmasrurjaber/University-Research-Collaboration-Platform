import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';


export const register = async (req, res) => {

    const {name, email, password, role, department} = req.body;

    if (!name || !email || !password || !role || !department) {
        return res.status(400).json({success: false, message: "Fill up all the required fields" });
    }
    try{
        const existingUser = await userModel.findOne({email});
        if (existingUser) {
            return res.status(400).json({success: false, message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({
            name,
            email,
            password: hashedPassword,
            role,
            department
        });
        await user.save();
        const token = jwt.sign({userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            profile: user.profile
        }
        return res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000
        }).json({success: true, user, message: `Account for ${user.name} created successfully!`});

    }catch (error){
        res.status(500).json({success: false, message: error.message})
    }
};

export const login = async(req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({success: false, message: "Email and password are required" });
    }

    try{
        const user = await userModel.findOneAndUpdate({email});
        if (!user) {
            return res.status(400).json({success: false, message: "Email or password is incorrect" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({success: false, message: "Email or password is incorrect" });
        }
        const token = jwt.sign({userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            profile: user.profile
        }
        return res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000
        }).json({success: true, user, message: `Welcome back ${user.name}`});

    } catch(error){
        return res.status(500).json({success: false, message: error.message });
    }

};

export const logout = async (req, res) => {
    try{
        return res.status(200).clearCookie("token").json({success: true, message: "Logged out successfully"});
    } catch(error){
        return res.status(500).json({success: false, message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    const {name, email, department, bio, profilePhotoUrl, interests} = req.body;
    const userId = req.user.id;
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({success: false, message: "User not found" });
        }

        user.name = name;
        user.email = email;
        user.department = department;
        user.profile.bio = bio;
        user.profile.profilePhotoUrl = profilePhotoUrl;
        user.profile.interests = interests;

        await user.save();
        user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            profile: user.profile
        }
        return res.status(200).json({success: true, message: "Profile updated successfully", user});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message });
    }

}