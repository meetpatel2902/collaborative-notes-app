const Note = require('../models/Note');
const User = require('../models/User'); 


const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note) {
          
            if (note.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to view this note' });
            }
            res.json(note);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const createNote = async (req, res) => {
    const { title, content, tags } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Please add a title and content' });
    }

    try {
        const note = new Note({
            user: req.user._id,
            title,
            content,
            tags: tags || [],
        });

        const createdNote = await note.save();
        res.status(201).json(createdNote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateNote = async (req, res) => {
    const { title, content, tags } = req.body;

    try {
        const note = await Note.findById(req.params.id);

        if (note) {
          
            if (note.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to update this note' });
            }

           
            if (note.lockedBy && note.lockedBy.toString() !== req.user._id.toString()) {
                const lockedByUser = await User.findById(note.lockedBy);
                return res.status(409).json({
                    message: `Note is currently locked by ${lockedByUser ? lockedByUser.username : 'another user'}.`,
                    lockedBy: lockedByUser ? lockedByUser.username : 'unknown',
                });
            }

            note.title = title || note.title;
            note.content = content || note.content;
            note.tags = tags !== undefined ? tags : note.tags; 
            note.lastUpdated = new Date(); 

            const updatedNote = await note.save();
            res.json(updatedNote);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note) {
         
            if (note.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
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
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
};