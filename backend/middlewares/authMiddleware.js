const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT ટોકન દ્વારા યુઝરને સુરક્ષિત (authenticate) કરવા માટેનું મિડલવેર
const protect = async (req, res, next) => {
    let token;

    // HTTP હેડરમાંથી Bearer ટોકન તપાસો
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 'Bearer' પછીનો ટોકન મેળવો
            token = req.headers.authorization.split(' ')[1];

            // ટોકનને JWT_SECRET વડે વેરીફાઈ કરો
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // ટોકનમાંથી યુઝર ID મેળવો અને પાસવર્ડ વિના યુઝર શોધો
            req.user = await User.findById(decoded.id).select('-password');

            next(); // આગળના મિડલવેર/રાઉટ હેન્ડલર પર જાઓ
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// યુઝર એડમિન છે કે નહીં તે તપાસવા માટેનું મિડલવેર [cite: 2]
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin')
         { 
        next(); // એડમિન હોય તો આગળ વધો
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };