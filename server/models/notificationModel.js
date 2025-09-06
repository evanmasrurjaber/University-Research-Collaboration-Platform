import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    type: {
        type: String,
        enum: [
            "project_approved", 
            "role_request_approved", 
            "role_request_rejected", 
            "new_role_request", 
            "new_comment", 
            "new_reply",
            "project_update",
            "project_completed"
        ],
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project"
    },
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries on recipient and isRead
notificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model("notification", notificationSchema);