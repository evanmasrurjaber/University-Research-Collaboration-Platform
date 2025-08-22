import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["student", "faculty"],
        default: "student",
        required: true
    },
    department: {
        type: String,
        required: true
    },
    profile: {
        profilePhotoUrl: { type: String },
        profilePhotoPublicId: { type: String },
        bio: { type: String },
        interests: [{ type: String }]
    },
    preferences: {
        theme: {
            type: String,
            enum: ["light", "dark"],
            default: "light"
        }
    }
}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;