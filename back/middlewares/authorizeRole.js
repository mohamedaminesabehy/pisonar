const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authorizeRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            // Extract token from Authorization header
            const token = req.header('Authorization')?.split(' ')[1];
            if (!token) return res.status(401).json({ error: 'Access Denied: No token provided' });

            // Verify the JWT Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");

            // Fetch the user from the database
            const user = await User.findById(decoded.userId).select('-password');
            if (!user) return res.status(404).json({ error: 'User not found' });

            // Ensure the user has the required role
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ error: 'Access Forbidden: Only doctors are allowed to perform this action' });
            }

            // Attach user data to request for further processing
            req.user = user;
            next();
        } catch (err) {
            res.status(403).json({ error: 'Invalid or expired token' });
        }
    };
};

module.exports = authorizeRole;
