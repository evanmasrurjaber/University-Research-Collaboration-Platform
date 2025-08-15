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
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            profile: user.profile,
            preferences: user.preferences
        }
        return res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000
        }).json({success: true, user: userResponse, message: `Account for ${userResponse.name} created successfully!`});

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
        const user = await userModel.findOne({email});
        if (!user) {
            return res.status(400).json({success: false, message: "Email or password is incorrect" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({success: false, message: "Email or password is incorrect" });
        }
        const token = jwt.sign({userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            profile: user.profile,
            preferences: user.preferences
        }
        return res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000
        }).json({success: true, user: userResponse, message: `Welcome back ${userResponse.name.split(" ")[0]}`});

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
    const userId = req.user.id;
    
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({success: false, message: "User not found" });
        }

        const allowedFields = ['name', 'email', 'department', 'profile.bio', 'profile.profilePhotoUrl', 'profile.interests'];
        const updatedFields = [];
        Object.entries(req.body).forEach(([key, value]) => {
            if (allowedFields.includes(key) && value !== undefined && value !== null) {
                let fieldPath = key; 
                if (fieldPath.includes('.')) {
                    fieldPath = fieldPath.split('.');
                    user[fieldPath[0]][fieldPath[1]] = value;
                } else {
                    user[fieldPath] = value;
                }
                updatedFields.push(key);
            }
        });

        if (updatedFields.length === 0) {
            return res.status(400).json({
                success: false, 
                message: "No valid fields provided for update"
            });
        }

        await user.save();
        
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            profile: user.profile,
            preferences: user.preferences
        }
        
        return res.status(200).json({
            success: true, 
            message: `Profile updated successfully. Updated fields: ${updatedFields.join(', ')}`, 
            user: userResponse
        });
    } catch (error) {
        return res.status(500).json({success: false, message: error.message });
    }

}

export const getTheme = async (req, res) => {
    const userId = req.user.id;
    
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({success: false, message: "User not found" });
        } 
        return res.status(200).json({
            success: true, 
            theme: user.preferences?.theme || "light",
            message: "Theme retrieved successfully"
        });
    } catch (error) {
        return res.status(500).json({success: false, message: error.message });
    }
};

export const updateTheme = async (req, res) => {
    const userId = req.user.id;
    const { theme } = req.body;
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({success: false, message: "User not found" });
        }

        if (!user.preferences) {
            user.preferences = {};
        }
        
        user.preferences.theme = theme;
        await user.save();
        
        return res.status(200).json({
            success: true, 
            theme: user.preferences.theme,
            message: `Theme updated to ${theme} successfully`
        });
    } catch (error) {
        return res.status(500).json({success: false, message: error.message });
    }
};