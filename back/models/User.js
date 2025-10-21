const mongoose = require('mongoose');

const options = { discriminatorKey: 'role', timestamps: true };

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [false, 'Full name is required'] },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientData",  // ✅ Référence au patient
      required: false
  },

    dateOfBirth: { type: Date, required: [false, 'Date of birth is required'] },
    gender: {
      type: String,
      required: [false, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    photo: { type: String }, // Assuming the photo is stored as a URL or file path
    otp: { type: String }, // For OTP verification
    otpExpires: { type: Date }, // OTP expiration time
    isEmailVerified: { type: Boolean, default: false }, // Email verification status
  },
  options // Pass the options object here
);

const User = mongoose.model('User', userSchema);
module.exports = User;