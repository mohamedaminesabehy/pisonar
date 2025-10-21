const mongoose = require('mongoose');
const User = require('./User');

const doctorSchema = new mongoose.Schema({
    specialization: { type: String, required: true },
    skills: { type: [String] }, // Array of skills
    about: { type: String }, // Description about the doctor
    languages: { type: [String] }, // Array of languages spoken
    address: { type: String }, // Address of the doctor
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },

}, { timestamps: true });

const Doctor = User.discriminator('Doctor', doctorSchema);
module.exports = Doctor;