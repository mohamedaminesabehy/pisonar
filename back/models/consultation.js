const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientData",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    emergencyLevel: {
      type: String,
      enum: ["low", "moderate", "critical"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
      default: "",
    },
    // NEW: Reference to the prescription document
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
    },
  },
  { timestamps: true }
);

const Consultation = mongoose.model("Consultation", consultationSchema);
module.exports = Consultation;
