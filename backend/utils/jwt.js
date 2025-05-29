const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in .env file.');
    process.exit(1);
}

const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
};

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

const jwtUtils = {
    generateToken,
    verifyToken,
};

module.exports = jwtUtils;