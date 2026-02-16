import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    niche: String,
    postType: String,
    visualStyle: String,
    platformFormat: String,
    userIdea: String,
    slideCount: Number,
    referenceImage: String,
    brandName: String,
    brandingPlacement: String,
    stages: {
        intent: Object,
        content: Object,
        visualPlan: Object,
        storyboardPrompt: Object,
        finalImages: [
            {
                url: String,
                prompt: String,
                slideIndex: Number,
            },
        ],
    },
    usage: {
        inputTokens: { type: Number, default: 0 },
        outputTokens: { type: Number, default: 0 },
        totalTokens: { type: Number, default: 0 },
        estimatedCost: { type: Number, default: 0 },
    },
    status: {
        type: String,
        enum: ['draft', 'completed'],
        default: 'draft',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Project', projectSchema);
