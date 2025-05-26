const User = require('../models/User');
const Note = require('../models/Note');

// @desc    Get all users and their notes
// @route   GET /api/admin/users
// @access  Private/Admin [cite: 8]
const getAllUsersAndNotes = async (req, res) => {
    try {
        // બધા યુઝર્સને શોધો
        const users = await User.find({}).select('-password'); // પાસવર્ડ વિના

        // દરેક યુઝર માટે તેમની નોંધો શોધો
        const usersWithNotes = await Promise.all(users.map(async (user) => {
            const notes = await Note.find({ user: user._id }).sort({ createdAt: -1 });
            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                notes: notes,
            };
        }));

        res.json(usersWithNotes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsersAndNotes,
};