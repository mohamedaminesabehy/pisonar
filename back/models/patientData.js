const mongoose = require('mongoose');
const User = require('./User');

const patientDataSchema = new mongoose.Schema({
  // Identification Fields
  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    index: true
  },

  // Personal Information
  age: { type: Number },
  phoneNumber: { type: String },
  contactInfo: { type: String },
  address: { type: String },
  // insuranceNumber: { type: String },
  insurance: { type: mongoose.Schema.Types.ObjectId, ref: 'Insurance' },
  cnam: { type: mongoose.Schema.Types.ObjectId, ref: 'CNAM' },

  // Medical Information
  medicalHistory: { type: [String], default: [] },
  chiefComplaint: { type: String },
  symptoms: { type: [String], default: [] },
  bloodPressure: { type: String },
  glycemicIndex: { type: Number },
  oxygenSaturation: { type: Number },

  // Emergency Department Status
  state: { 
    type: String, 
    enum: ["low", "moderate", "critical"], 
    default: 'low' 
  },
  status: { 
    type: String, 
    enum: ['Waiting for Doctor', 'Under Examination', 'Discharged'], 
    default: 'Waiting for Doctor' 
  },

  // Doctor assignment
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor', // Reference to the Doctor model
    default: null
  },


  // Assigned resources (array of Resource references)
  assignedResources: {
    type: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' } ],
    default: []
  }
}, { timestamps: true }); // Automatic createdAt and updatedAt

module.exports = mongoose.model('PatientData', patientDataSchema);

