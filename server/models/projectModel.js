import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["proposed", "approved", "ongoing", "under_review", "finished"],
        default: "proposed"
    },
    progressPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    initiator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    department: {
        type: String,
        required: true
    },
    participants: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            },
            role: {
                type: String,
                required: true
            },
            status: {
                type: String,
                enum: ["invited", "requested", "accepted", "rejected"],
                default: "invited"
            }
        }
    ],
    openRoles: [
        {
            title: String,
            description: String,
            isOpen: {
                type: Boolean,
                default: true
            }
        }
    ],
    attachments: [
        {
            title: String,
            fileUrl: String,
            filePublicId: String,
            uploadedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            },
            comment: String,
            rating: Number,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            },
            text: String,
            createdAt: {
                type: Date,
                default: Date.now
            },
            replies: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "user"
                    },
                    text: String,
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ]
        }
    ],
    tags: [String]
}, { timestamps: true });

const projectModel = mongoose.models.project || mongoose.model("project", projectSchema);

export default projectModel;