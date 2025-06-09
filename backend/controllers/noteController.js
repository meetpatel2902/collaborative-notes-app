// backend/controllers/noteController.js
const Note = require('../models/Note');
<<<<<<< HEAD

exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
=======
const User = require('../models/User');

exports.getNotes = async (req, res) => {
    try {
         const notes = await Note.find()
            .populate('owner', 'username')
            .populate('collaborators', 'username')
            .sort({ updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        console.error('Error in getNotes:', error); 
        res.status(500).json({ message: error.message });
>>>>>>> 26c5641088948f08b786bad3489b6a599a7c3caf
    }
};

exports.getNoteById = async (req, res) => {
    try {
<<<<<<< HEAD
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
=======
        const note = await Note.findById(req.params.id)
            .populate('owner', 'username')
            .populate('collaborators', 'username');

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

       
        const isOwner = note.owner.toString() === req.user._id.toString();
        const isCollaborator = note.collaborators.some(collabId => collabId.toString() === req.user._id.toString());

        if (!note.isPublic && !isOwner && !isCollaborator && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to view this note' });
        }

        res.json(note);
    } catch (error) {
        console.error('Error in getNoteById:', error); 
        res.status(500).json({ message: error.message });
>>>>>>> 26c5641088948f08b786bad3489b6a599a7c3caf
    }
};

exports.createNote = async (req, res) => {
<<<<<<< HEAD
    const { title, content, tags } = req.body;
    try {
        const note = new Note({
            title,
            content,
            tags,
            user: req.user.id
        });
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
=======
    const { title, content, tags, isPublic, collaborators } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Please add a title and content' });
    }

    try {
        const newNote = new Note({
            owner: req.user._id,
            title,
            content,
            tags: tags || [],
            isPublic: isPublic || false,
            collaborators: Array.isArray(collaborators) ? collaborators.filter(collabId => collabId.toString() !== req.user._id.toString()) : [],
        });

        const createdNote = await newNote.save();

        await createdNote.populate('owner', 'username');
        await createdNote.populate('collaborators', 'username');

        res.status(201).json(createdNote);
    } catch (error) {
        console.error('Error in createNote:', error); 
        if (error.code === 11000) { 
            return res.status(400).json({ message: 'A note with this title already exists.' });
        }
        res.status(500).json({ message: error.message });
>>>>>>> 26c5641088948f08b786bad3489b6a599a7c3caf
    }
};

exports.updateNote = async (req, res) => {
<<<<<<< HEAD
    const { title, content, tags } = req.body;
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        note.title = title || note.title;
        note.content = content || note.content;
        note.tags = tags || note.tags;
        note.lastUpdated = Date.now();
        await note.save();
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
=======
    const { title, content, tags, isPublic, collaborators } = req.body;

    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const isOwner = note.owner.toString() === req.user._id.toString();
        const isCollaborator = note.collaborators.some(collabId => collabId.toString() === req.user._id.toString());

        if (!isOwner && !isCollaborator && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to update this note.' });
        }

        if (note.lockedBy && note.lockedBy.toString() !== req.user._id.toString()) {
            const lockedByUser = await User.findById(note.lockedBy);
            return res.status(409).json({
                message: `Note is currently locked by ${lockedByUser ? lockedByUser.username : 'another user'}.`,
                lockedBy: lockedByUser ? lockedByUser.username : 'unknown',
            });
        }

        let updatedCollaborators = collaborators;
        if (Array.isArray(updatedCollaborators)) {
            updatedCollaborators = updatedCollaborators.filter(collabId =>
                collabId.toString() !== note.owner.toString()
            );
            updatedCollaborators = [...new Set(updatedCollaborators)];
        }

        note.title = title !== undefined ? title : note.title;
        note.content = content !== undefined ? content : note.content;
        note.tags = tags !== undefined ? tags : note.tags;
        note.isPublic = isPublic !== undefined ? isPublic : note.isPublic;
        note.collaborators = updatedCollaborators !== undefined ? updatedCollaborators : note.collaborators;
        note.updatedAt = new Date(); 
        const updatedNote = await note.save();

        await updatedNote.populate('owner', 'username');
        await updatedNote.populate('collaborators', 'username');

        res.json(updatedNote);
    } catch (error) {
        console.error('Error in updateNote:', error); 
        if (error.code === 11000) { 
            return res.status(400).json({ message: 'A note with this title already exists.' });
        }
        res.status(500).json({ message: error.message });
>>>>>>> 26c5641088948f08b786bad3489b6a599a7c3caf
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
<<<<<<< HEAD
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        await note.remove();
        res.json({ message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
=======

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (note.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to delete this note' });
        }

        if (note.lockedBy && note.lockedBy.toString() !== req.user._id.toString()) {
            const lockedByUser = await User.findById(note.lockedBy);
            return res.status(409).json({
                message: `Note is currently locked by ${lockedByUser ? lockedByUser.username : 'another user'}. Cannot delete.`,
                lockedBy: lockedByUser ? lockedByUser.username : 'unknown',
            });
        }

        await note.deleteOne(); 
        res.json({ message: 'Note removed' });
    } catch (error) {
        console.error('Error in deleteNote:', error); 
        res.status(500).json({ message: error.message });
>>>>>>> 26c5641088948f08b786bad3489b6a599a7c3caf
    }
};