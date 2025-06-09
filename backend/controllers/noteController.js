// backend/controllers/noteController.js
const Note = require('../models/Note');

exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getNoteById = async (req, res) => {
    try {
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
    }
};

exports.createNote = async (req, res) => {
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
    }
};

exports.updateNote = async (req, res) => {
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
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
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
    }
};