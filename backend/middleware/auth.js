const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    // 1️⃣ Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2️⃣ Extract token from "Bearer TOKEN_HERE"
            token = req.headers.authorization.split(' ')[1];
            // 3️⃣ Verify token is valid (not expired, correct signature)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // 4️⃣ Attach user info to request for next functions to use
            req.user = await User.findById(decoded.id).select('-password');
            // 5️⃣ Continue to the actual API function
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized' });
        }
    }
    // No token provided
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };