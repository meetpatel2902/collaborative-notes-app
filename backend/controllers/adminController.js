const User = require('../models/User');
const Note = require('../models/Note');

exports.getAllUsersAndNotes = async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('notes');
        res.status(200).json(users);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};