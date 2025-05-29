const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwtUtils = require('../utils/jwt');

const SUPER_ADMIN_KEY = process.env.SUPER_ADMIN_KEY;

exports.signup = async (req, res) => {
    const { username, email, password, isAdmin, superAdminKey } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let role = 'User';

        if (isAdmin) {
            if (!superAdminKey || superAdminKey !== SUPER_ADMIN_KEY) {
                return res.status(403).json({ message: 'Invalid Super Admin Key. Cannot register as Admin.' });
            }
            role = 'Admin';
            console.log(`New Admin user registration attempt: ${email}`);
        }

        user = new User({
            username,
            email,
            password,
            role
        });

        await user.save();

        const payload = {
            id: user._id,
            username: user.username,
            role: user.role,
        };

        const token = jwtUtils.generateToken(payload);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            username: user.username,
            role: user.role
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = {
            id: user._id,
            username: user.username,
            role: user.role,
        };

        const token = jwtUtils.generateToken(payload);

        res.status(200).json({
            message: 'Login successful',
            token,
            username: user.username,
            role: user.role
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};