const mongoose = require('mongoose');

const CNAMSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Assurance code is required'],
      unique: true,
      trim: true
    },
    percentage: {
      type: Number,
      required: [true, 'Percentage is required'],
      min: [0, 'Percentage cannot be less than 0'],
      max: [100, 'Percentage cannot be greater than 100']
    },
    isActive: {
      type: Boolean,
      default: false
    },
    
    cansilationDate: {
      type: Date,
      required: [true, 'Cansilation date is required']
    }
  },
  { timestamps: true }
);

const CNAM = mongoose.model('CNAM', CNAMSchema);
module.exports = CNAM;
