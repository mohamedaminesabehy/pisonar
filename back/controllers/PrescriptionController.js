// controllers/prescriptionController.js
const mongoose     = require("mongoose");
const Prescription = require("../models/Prescription");
const Patient      = require("../models/patientData");
const User         = require("../models/User");
const Pharmacy     = require("../models/Pharmacy");
const crypto       = require("crypto");





// ➤ Récupérer les prescriptions d’un patient à partir de son userId
async function getPrescriptionsByUser(req, res) {
  try {
    const { userId } = req.params;

    // 1) Validation de l’ID user
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID format." });
    }

    // 2) Récupérer le user pour en extraire le patientId
    const user = await User.findById(userId).select("patient");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    if (!user.patient) {
      return res
        .status(404)
        .json({ success: false, message: "No patient associated to this user." });
    }

    // 3) Récupérer toutes les prescriptions pour ce patient
    const prescriptions = await Prescription.find({ patient: user.patient })
      .populate("patient", "firstName lastName email")
      .populate("doctor",  "fullName specialization")
      .populate("medications.medication", "nomMedicament prix")
      .select("-__v");

    return res
      .status(200)
      .json({ success: true, data: prescriptions });

  } catch (error) {
    console.error("getPrescriptionsByUser error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// ─── CREATE A PRESCRIPTION ─────────────────────────────────────────────
async function addPrescription(req, res) {
  try {
    const { patient: patientIdOrName, doctor: doctorIdOrName, medications, description } = req.body;

    // 1) Locate the patient (by ID or firstName)
    const patientQuery = mongoose.Types.ObjectId.isValid(patientIdOrName)
      ? { _id: patientIdOrName }
      : { firstName: patientIdOrName };
    let patientDoc = await Patient.findOne(patientQuery)
      .populate("insurance")
      .populate("cnam");
    if (!patientDoc) {
      return res.status(404).json({ error: `Patient '${patientIdOrName}' not found.` });
    }

    // 2) Locate the doctor (by ID or firstName & role)
    const doctorQuery = mongoose.Types.ObjectId.isValid(doctorIdOrName)
      ? { _id: doctorIdOrName, role: "Doctor" }
      : { firstName: doctorIdOrName, role: "Doctor" };
    const doctorDoc = await User.findOne(doctorQuery);
    if (!doctorDoc) {
      return res.status(404).json({ error: `Doctor '${doctorIdOrName}' not found.` });
    }

    // 3) Validate & resolve each medication
    const validMeds = [];
    for (const m of medications) {
      const medQuery = mongoose.Types.ObjectId.isValid(m.medication)
        ? { _id: m.medication }
        : { nomMedicament: m.medication };
      const medDoc = await Pharmacy.findOne(medQuery);
      if (!medDoc) {
        return res.status(404).json({ error: `Medication '${m.medication}' not found.` });
      }
      if (m.quantity < 1 || m.duration < 1 || m.timesPerDay < 1) {
        return res.status(400).json({ error: `Invalid medication parameters for '${medDoc.nomMedicament}'.` });
      }
      validMeds.push({
        medication: medDoc._id,
        quantity:   m.quantity,
        duration:   m.duration,
        timesPerDay:m.timesPerDay,
      });
    }

    // 4) Compute discount: max of active insurance & CNAM percentages
    const insPct = (patientDoc.insurance && patientDoc.insurance.isActive)
      ? patientDoc.insurance.percentage : 0;
    const cnamPct = (patientDoc.cnam && patientDoc.cnam.isActive)
      ? patientDoc.cnam.percentage : 0;
    const discount = Math.max(insPct, cnamPct);

    // 5) Generate unique codePrescription
    const codePrescription = `RX-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // 6) Create & save
    const newPresc = new Prescription({
      _id:              new mongoose.Types.ObjectId(),
      codePrescription,
      patient:          patientDoc._id,
      doctor:           doctorDoc._id,
      medications:      validMeds,
      description:      description || "",
      status:           "Pending",
      discount,
    });
    await newPresc.save();

    return res
      .status(201)
      .json({ message: "Prescription added successfully", data: newPresc });
  } catch (error) {
    console.error("addPrescription error:", error);
    return res.status(500).json({ error: "Server error while adding prescription." });
  }
}

// ─── GET ALL PRESCRIPTIONS ────────────────────────────────────────────
async function getAllPrescriptions(req, res) {
  try {
    const prescriptions = await Prescription.find()
      .populate("patient", "firstName email")
      .populate("doctor",  "fullName specialization")
      .populate("medications.medication", "nomMedicament prix")
      .select("-__v");
    return res.status(200).json(prescriptions);
  } catch (error) {
    console.error("getAllPrescriptions error:", error);
    return res.status(500).json({ error: "Server error while retrieving prescriptions." });
  }
}

// ─── GET A PRESCRIPTION BY ID ─────────────────────────────────────────
async function getPrescriptionById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid prescription ID format." });
    }
    const presc = await Prescription.findById(id)
      .populate("patient", "firstName email")
      .populate("doctor",  "fullName specialization")
      .populate("medications.medication", "nomMedicament prix")
      .select("-__v");
    if (!presc) {
      return res.status(404).json({ error: "Prescription not found." });
    }
    return res.status(200).json(presc);
  } catch (error) {
    console.error("getPrescriptionById error:", error);
    return res.status(500).json({ error: "Server error while retrieving prescription." });
  }
}

// ─── UPDATE A PRESCRIPTION ────────────────────────────────────────────
async function updatePrescription(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid prescription ID format." });
    }

    // Destructure only updatable fields
    const { description, status, medications } = req.body;
    const updateFields = {};
    if (description !== undefined) updateFields.description = description;
    if (status !== undefined) {
      const valid = ["Pending", "Failed", "Delivered"];
      if (!valid.includes(status)) {
        return res.status(400).json({ error: "Invalid status." });
      }
      updateFields.status = status;
    }
    if (medications !== undefined) {
      // (optional) re-validate meds like above
      updateFields.medications = medications;
    }

    // 1) Apply the update
    let presc = await Prescription.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });
    if (!presc) {
      return res.status(404).json({ error: "Prescription not found." });
    }

    // 2) Recompute discount based on patient’s current coverage
    const patientDoc = await Patient.findById(presc.patient)
      .populate("insurance")
      .populate("cnam");
    const insPct  = (patientDoc.insurance && patientDoc.insurance.isActive)
      ? patientDoc.insurance.percentage : 0;
    const cnamPct = (patientDoc.cnam && patientDoc.cnam.isActive)
      ? patientDoc.cnam.percentage : 0;
    presc.discount = Math.max(insPct, cnamPct);

    await presc.save();
    return res
      .status(200)
      .json({ message: "Prescription updated successfully", data: presc });
  } catch (error) {
    console.error("updatePrescription error:", error);
    return res.status(500).json({ error: "Server error while updating prescription." });
  }
}

// ─── DELETE A PRESCRIPTION ────────────────────────────────────────────
async function deletePrescription(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid prescription ID format." });
    }
    const deleted = await Prescription.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Prescription not found." });
    }
    return res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (error) {
    console.error("deletePrescription error:", error);
    return res.status(500).json({ error: "Server error while deleting prescription." });
  }
}

// ─── GET BY DOCTOR ────────────────────────────────────────────────────
async function getPrescriptionsByDoctor(req, res) {
  try {
    const { doctorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid doctor ID." });
    }
    const results = await Prescription.find({ doctor: doctorId })
      .populate("patient", "firstName lastName email")
      .populate("doctor",  "fullName specialization")
      .populate("medications.medication", "nomMedicament prix");
    return res.status(200).json(results);
  } catch (error) {
    console.error("getPrescriptionsByDoctor error:", error);
    return res.status(500).json({ error: "Server error while fetching prescriptions." });
  }
}

module.exports = {
  addPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  getPrescriptionsByDoctor,
  getPrescriptionsByUser,
};
