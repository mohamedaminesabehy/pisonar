const express = require('express');
const router = express.Router();
const leaveRequestController = require('../controllers/LeaveRequestController');
const authorizeRole = require('../middlewares/authorizeRole');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    
    // Add error handling for token verification
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ success: false, error: 'Token is invalid or expired' });
    }
    
    // Add error handling for user lookup
    try {
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }
      
      req.user = user;
      next();
    } catch (err) {
      console.error('User lookup error:', err);
      return res.status(500).json({ success: false, error: 'Server error during authentication' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ success: false, error: 'Token is not valid' });
  }
};

// Create a new leave request (doctors and nurses only)
router.post('/', authenticate, authorizeRole(['Doctor', 'Nurse']), leaveRequestController.createLeaveRequest);

// Get all leave requests for the logged-in user
router.get('/my-requests', authenticate, authorizeRole(['Doctor', 'Nurse']), leaveRequestController.getMyLeaveRequests);

// Get all leave requests (admin only)
router.get('/all', authenticate, authorizeRole(['Admin']), leaveRequestController.getAllLeaveRequests);

// Get leave statistics (admin only)
router.get('/statistics', authenticate, authorizeRole(['Admin']), leaveRequestController.getLeaveStatistics);

// Get leave request by ID
router.get('/:id', authenticate, leaveRequestController.getLeaveRequestById);

// Update leave request status (admin only)
router.put('/:id/status', authenticate, authorizeRole(['Admin']), leaveRequestController.updateLeaveRequestStatus);

// Cancel a leave request (staff can only cancel their own pending requests)
router.delete('/:id', authenticate, authorizeRole(['Doctor', 'Nurse']), leaveRequestController.cancelLeaveRequest);

module.exports = router;