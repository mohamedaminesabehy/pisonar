const mongoose = require('mongoose');
const User = require('./User');

const patientSchema = new mongoose.Schema({
    address: { type: String },
    medicalHistory: { type: Array, default: [] },
    insuranceNumber: { type: String },
   
}, { timestamps: true });

const Patient = User.discriminator('Patient', patientSchema);
module.exports = Patient;