/*const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    title: String,
    subject: String,
    description: String,
    status: {
  type: String,
  enum: ['not-started', 'in-progress', 'completed'],
  required: true
},
    deadline: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Project", ProjectSchema);*/

const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
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
    deadline: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Project", ProjectSchema);