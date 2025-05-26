const Note = require('../models/Note');
const User = require('../models/User'); // યુઝરના નામ મેળવવા માટે

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note) {
            // ખાતરી કરો કે યુઝર આ નોંધનો માલિક છે (અથવા એડમિન)
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

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
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
            tags: tags || [], // જો ટૅગ્સ ન હોય તો ખાલી એરે આપો
        });

        const createdNote = await note.save();
        res.status(201).json(createdNote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
    const { title, content, tags } = req.body;

    try {
        const note = await Note.findById(req.params.id);

        if (note) {
            // ખાતરી કરો કે યુઝર આ નોંધનો માલિક છે (અથવા એડમિન)
            if (note.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to update this note' });
            }

            // રીઅલ-ટાઇમ કોલાબોરેશન લોક ચેક [cite: 12]
            if (note.lockedBy && note.lockedBy.toString() !== req.user._id.toString()) {
                const lockedByUser = await User.findById(note.lockedBy);
                return res.status(409).json({ // 409 Conflict
                    message: `Note is currently locked by ${lockedByUser ? lockedByUser.username : 'another user'}.`,
                    lockedBy: lockedByUser ? lockedByUser.username : 'unknown',
                });
            }

            note.title = title || note.title;
            note.content = content || note.content;
            note.tags = tags !== undefined ? tags : note.tags; // જો ટૅગ્સ ખાલી મોકલ્યા હોય તો પણ અપડેટ કરો
            note.lastUpdated = new Date(); // lastUpdated ને મેન્યુઅલી અપડેટ કરો (timestamps દ્વારા પણ થાય છે)

            const updatedNote = await note.save();
            res.json(updatedNote);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note) {
            // ખાતરી કરો કે યુઝર આ નોંધનો માલિક છે (અથવા એડમિન)
            if (note.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to delete this note' });
            }

            // રીઅલ-ટાઇમ કોલાબોરેશન લોક ચેક (ડિલીટ કરતા પહેલા)
            if (note.lockedBy && note.lockedBy.toString() !== req.user._id.toString()) {
                const lockedByUser = await User.findById(note.lockedBy);
                return res.status(409).json({
                    message: `Note is currently locked by ${lockedByUser ? lockedByUser.username : 'another user'}. Cannot delete.`,
                    lockedBy: lockedByUser ? lockedByUser.username : 'unknown',
                });
            }

            await note.deleteOne(); // Mongoose 6+ માં .remove() ને બદલે .deleteOne()
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