const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    isPublic: { 
        type: Boolean,
        default: false,
    },
    collaborators: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
    }],
    lockedBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, {
    timestamps: true 
});

module.exports = mongoose.models.Note || mongoose.model('Note', noteSchema);