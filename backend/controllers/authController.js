const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT ટોકન જનરેટ કરવા માટે helper function
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // 1 કલાકમાં એક્સપાયર થશે
    });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // યુઝર પહેલાથી અસ્તિત્વમાં છે કે નહીં તે તપાસો
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    try {
        // નવો યુઝર બનાવો
        const user = await User.create({
            username,
            email,
            password,
        });

        if (user) {
            res.status(201).json({ // 201 Created
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id), // JWT ટોકન જનરેટ કરો
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        // ડુપ્લિકેટ યુઝરનેમ અથવા ઇમેઇલ ભૂલોને હેન્ડલ કરો
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or Email already in use' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    // ઇમેઇલ દ્વારા યુઝર શોધો
    const user = await User.findOne({ email });

    // જો યુઝર અસ્તિત્વમાં હોય અને પાસવર્ડ મેચ થાય
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' }); // 401 Unauthorized
    }
};

module.exports = { registerUser, authUser };