import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import projectModel from '../models/projectModel.js';
import getDataUri from '../utils/dataUri.js';
import cloudinary from '../utils/cloudinary.js';


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
        return res.status(200).clearCookie("token").json({success: true, message: "Logged out"});
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

        const allowedFields = ['name', 'department', 'profile.bio', 'profile.interests', 'profile.profilePhotoUrl'];
        const updatedFields = [];
        const file = req.file;

        if (file) {
            const oldPublicId = user.profile?.profilePhotoPublicId;
            if (oldPublicId) {
                try {
                    await cloudinary.uploader.destroy(oldPublicId);
                } catch (err) {
                    console.error('Cloudinary destroy error:', err.message);
                }
            }

            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                folder: 'user-profile-photos'
            });
            if (cloudResponse) {
                user.profile.profilePhotoUrl = cloudResponse.secure_url;
                user.profile.profilePhotoPublicId = cloudResponse.public_id;
                updatedFields.push('PROFILE PHOTO');
            }
        }


        Object.entries(req.body).forEach(([key, value]) => {
            if (allowedFields.includes(key) && value !== undefined && value !== null) {
                let fieldPath = key; 
                console.log(key)
                if (fieldPath.includes('.')) {
                    fieldPath = fieldPath.split('.');
                    const prev = user[fieldPath[0]][fieldPath[1]]
                    if (key === 'profile.interests') {
                        const val = JSON.parse(value);
                        if (prev.length !== val.length) {
                            user[fieldPath[0]][fieldPath[1]] = val;
                            updatedFields.push(fieldPath[1].toUpperCase());
                        } else {
                            if (!prev.every((i, index) => i == val[index])) {
                                user[fieldPath[0]][fieldPath[1]] = val;
                                updatedFields.push(fieldPath[1].toUpperCase());
                            }
                        }
                    } else if (key === 'profile.profilePhotoUrl') {
                        if (value === "") {
                            user.profile.profilePhotoUrl = "";
                            try{
                                cloudinary.uploader.destroy(user.profile?.profilePhotoPublicId)
                            } catch (err) {
                            }
                            user.profile.profilePhotoPublicId = "";
                            
                        }
                        updatedFields.push("Profile Photo");
                    } else{
                        if (prev !== value) {
                            user[fieldPath[0]][fieldPath[1]] = value;
                            updatedFields.push(fieldPath[1].toUpperCase());
                        }
                    }
                } else {
                    if (user[fieldPath] !== value) {
                        user[fieldPath] = value;
                        updatedFields.push(fieldPath.toUpperCase());
                    }
                }
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
            message: `${updatedFields.slice(0, -1).join(', ')}` + `${updatedFields.length > 1 ? ' and ' : ''}` + `${updatedFields.at(-1)} updated successfully`, 
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

export const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            profile: user.profile,
            preferences: user.preferences
        };
        return res.status(200).json({ success: true, user: userResponse });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id)
      .select('name email role department profile.profilePhotoUrl createdAt');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const initiatedProjects = await projectModel.find({ initiator: id })
      .select('title status progressPercentage createdAt mentor')
      .populate('mentor', 'name profile.profilePhotoUrl')
      .sort({ createdAt: -1 });

    const mentoringProjects = await projectModel.find({ mentor: id })
      .select('title status progressPercentage createdAt initiator')
      .populate('initiator', 'name profile.profilePhotoUrl')
      .sort({ createdAt: -1 });

    const participatingProjects = await projectModel.find({
      participants: { $elemMatch: { user: id, status: 'accepted' } },
      initiator: { $ne: id },
      mentor: { $ne: id }
    })
      .select('title status progressPercentage createdAt initiator mentor')
      .populate('initiator', 'name profile.profilePhotoUrl')
      .populate('mentor', 'name profile.profilePhotoUrl')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      user,
      projects: {
        initiated: initiatedProjects,
        mentoring: mentoringProjects,
        participating: participatingProjects
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel
            .find({}, "-password")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("getAllUsers error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
};