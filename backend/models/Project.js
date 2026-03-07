const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    id: String,
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        trim: true,
        default: ''
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
        required: true
    },
    status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed'],
        default: 'not-started',
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    tasks: {
        type: [TaskSchema],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
ProjectSchema.pre('save', async function() {
    this.updatedAt = Date.now();
});

ProjectSchema.pre('findOneAndUpdate', async function() {
    this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model("Project", ProjectSchema);