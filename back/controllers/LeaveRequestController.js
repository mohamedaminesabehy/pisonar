const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');
const Notification = require('../models/Notification');

// Create a new leave request
exports.createLeaveRequest = async (req, res) => {
  try {
    console.log("Received leave request:", req.body);
    console.log("User:", req.user);
    
    const { startDate, endDate, reason, leaveType, urgencyLevel, contactNumber, attachmentPhoto } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Validate user role
    if (userRole !== 'Doctor' && userRole !== 'Nurse') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only doctors and nurses can submit leave requests' 
      });
    }

    // Validate required fields
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ 
        success: false, 
        error: 'Start date, end date and reason are required' 
      });
    }

    // Validate dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }
    
    if (startDateObj > endDateObj) {
      return res.status(400).json({ 
        success: false, 
        error: 'End date must be after start date' 
      });
    }

    // Get user's full name
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Calculate total days
    const diffTime = Math.abs(endDateObj - startDateObj);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Create new leave request
    const leaveRequest = new LeaveRequest({
      staffId: userId,
      staffName: user.fullName || `${user.firstName} ${user.lastName}`,
      staffRole: userRole,
      startDate: startDateObj,
      endDate: endDateObj,
      reason,
      leaveType: leaveType || 'Vacation',
      urgencyLevel: urgencyLevel || 'Low',
      contactNumber: contactNumber || '',
      attachmentPhoto: attachmentPhoto || '',
      totalDays
    });

    const savedRequest = await leaveRequest.save();

    // Create notification for admins
    try {
      const admins = await User.find({ role: 'Admin' });
      
      if (admins.length > 0) {
        const notifications = admins.map(admin => ({
          recipient: admin._id,
          recipientModel: 'Admin',
          message: `New ${urgencyLevel || 'Low'} priority ${leaveType || 'Vacation'} leave request from ${user.fullName || `${user.firstName} ${user.lastName}`} (${userRole})`,
          read: false
        }));

        await Notification.insertMany(notifications);
      }
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Continue execution even if notification creation fails
    }

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: savedRequest
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: error.message
    });
  }
};

// Get all leave requests for the logged-in user
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const leaveRequests = await LeaveRequest.find({ staffId: userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Get all leave requests (admin only)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    // Optional filtering by status, leaveType, and urgencyLevel
    const { status, leaveType, urgencyLevel, startDate, endDate } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;
    if (urgencyLevel) filter.urgencyLevel = urgencyLevel;
    
    // Date range filtering
    if (startDate || endDate) {
      filter.startDate = {};
      filter.endDate = {};
      
      if (startDate) {
        filter.startDate.$gte = new Date(startDate);
      }
      
      if (endDate) {
        filter.endDate.$lte = new Date(endDate);
      }
    }
    
    const leaveRequests = await LeaveRequest.find(filter)
      .sort({ urgencyLevel: -1, createdAt: -1 }) // Sort by urgency first, then by creation date
      .populate('reviewedBy', 'fullName');
    
    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error('Error fetching all leave requests:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Update leave request status (admin only)
exports.updateLeaveRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const adminId = req.user._id;

    // Validate status
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid status (Approved or Rejected) is required' 
      });
    }

    const leaveRequest = await LeaveRequest.findById(id);
    
    if (!leaveRequest) {
      return res.status(404).json({ 
        success: false, 
        error: 'Leave request not found' 
      });
    }

    // Update the leave request
    leaveRequest.status = status;
    if (adminComment) leaveRequest.adminComment = adminComment;
    leaveRequest.reviewedBy = adminId;
    leaveRequest.reviewedAt = new Date();

    const updatedRequest = await leaveRequest.save();

    // Create notification for the staff member
    await Notification.create({
      recipient: leaveRequest.staffId,
      recipientModel: leaveRequest.staffRole,
      message: `Your ${leaveRequest.leaveType} leave request has been ${status.toLowerCase()}${adminComment ? `: ${adminComment}` : ''}`,
      read: false
    });

    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error updating leave request status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Get leave request by ID
exports.getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const leaveRequest = await LeaveRequest.findById(id)
      .populate('reviewedBy', 'fullName');
    
    if (!leaveRequest) {
      return res.status(404).json({ 
        success: false, 
        error: 'Leave request not found' 
      });
    }

    // Check if user is authorized to view this request
    if (userRole !== 'Admin' && leaveRequest.staffId.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to view this leave request' 
      });
    }
    
    res.status(200).json(leaveRequest);
  } catch (error) {
    console.error('Error fetching leave request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Cancel a leave request (staff can only cancel their own pending requests)
exports.cancelLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const leaveRequest = await LeaveRequest.findById(id);
    
    if (!leaveRequest) {
      return res.status(404).json({ 
        success: false, 
        error: 'Leave request not found' 
      });
    }

    // Check if user is authorized to cancel this request
    if (leaveRequest.staffId.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to cancel this leave request' 
      });
    }

    // Check if request is still pending
    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Only pending requests can be cancelled' 
      });
    }

    await LeaveRequest.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling leave request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Get leave statistics (admin only)
exports.getLeaveStatistics = async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await LeaveRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Get counts by staff role
    const roleCounts = await LeaveRequest.aggregate([
      { $group: { _id: "$staffRole", count: { $sum: 1 } } }
    ]);
    
    // Get average leave duration
    const avgDuration = await LeaveRequest.aggregate([
      {
        $project: {
          daysDiff: {
            $add: [
              { $divide: [{ $subtract: ["$endDate", "$startDate"] }, 1000 * 60 * 60 * 24] },
              1 // Add 1 to include both start and end days
            ]
          }
        }
      },
      { $group: { _id: null, avgDays: { $avg: "$daysDiff" } } }
    ]);
    
    // Get monthly distribution
    const monthlyDistribution = await LeaveRequest.aggregate([
      {
        $project: {
          month: { $month: "$startDate" },
          year: { $year: "$startDate" }
        }
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        byStatus: statusCounts,
        byRole: roleCounts,
        averageDuration: avgDuration.length > 0 ? avgDuration[0].avgDays : 0,
        monthlyDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching leave statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};