const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staffName: {
    type: String,
    required: true
  },
  staffRole: {
    type: String,
    enum: ['Doctor', 'Nurse'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    enum: ['Medical', 'Vacation', 'Personal', 'Family', 'Other'],
    required: true,
    default: 'Vacation'
  },
  urgencyLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  contactNumber: {
    type: String,
    default: ''
  },
  attachmentPhoto: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  adminComment: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  totalDays: {
    type: Number,
    default: function() {
      if (this.startDate && this.endDate) {
        const diffTime = Math.abs(this.endDate - this.startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }
      return 0;
    }
  }
}, { timestamps: true });

// Validate that end date is after start date
leaveRequestSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

// Calculate total days before saving
leaveRequestSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
module.exports = LeaveRequest;