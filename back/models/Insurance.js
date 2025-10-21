const mongoose = require('mongoose');

const InsuranceSchema = new mongoose.Schema(
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

    expirationDate: {
      type: Date,
      required: [true, 'Expiration date is required']
    }
  },
  { timestamps: true }
);

const Insurance = mongoose.model('Insurance', InsuranceSchema);
module.exports = Insurance;
