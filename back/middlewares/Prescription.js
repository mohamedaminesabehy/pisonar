const Prescription = require("../models/Prescription");
const Patient = require("../models/patientData");
const Doctor = require("../models/Doctor");
const Pharmacy = require("../models/Pharmacy");

// ✅ Middleware to validate prescription data before creation or update
const validatePrescriptionData = async (req, res, next) => {
    try {
        const { patient, doctor, medications, cnamCovered } = req.body;

        // 🔹 Ensure required fields are provided
        if (!patient || !doctor || !medications || medications.length === 0) {
            return res.status(400).json({ error: "Patient, doctor, and at least one medication are required." });
        }

        // 🔹 Validate patient and doctor existence (optimized)
        const [patientExists, doctorExists] = await Promise.all([
            Patient.findById(patient),
            Doctor.findById(doctor)
        ]);

        if (!patientExists) return res.status(404).json({ error: "Patient not found." });
        if (!doctorExists) return res.status(404).json({ error: "Doctor not found." });

        // 🔹 Validate medications (ensuring existence and valid fields)
        for (const med of medications) {
            const medExists = await Pharmacy.findById(med.medication);
            if (!medExists) {
                return res.status(404).json({ error: `Medication with ID ${med.medication} not found.` });
            }
            if (!med.quantity || med.quantity <= 0) {
                return res.status(400).json({ error: `Invalid quantity for medication ${medExists.nomMedicament}.` });
            }
            if (!med.duration || med.duration <= 0) {
                return res.status(400).json({ error: `Invalid duration for medication ${medExists.nomMedicament}.` });
            }
            if (!med.timesPerDay || med.timesPerDay <= 0) {
                return res.status(400).json({ error: `Invalid times per day for medication ${medExists.nomMedicament}.` });
            }
        }

        // 🔹 Validate `cnamCovered`
        if (cnamCovered !== undefined && typeof cnamCovered !== "boolean") {
            return res.status(400).json({ error: "Invalid value for CNAM coverage. Must be true or false." });
        }

        next();
    } catch (error) {
        console.error("Validation error:", error);
        res.status(500).json({ error: "Server error during prescription validation." });
    }
};

// ✅ Middleware to check if a prescription exists before modification/deletion
const checkPrescriptionExists = async (req, res, next) => {
    try {
        const prescription = await Prescription.findById(req.params.id);

        if (!prescription) {
            return res.status(404).json({ error: "Prescription not found." });
        }

        req.prescription = prescription; // Store prescription for quick access
        next();
    } catch (error) {
        console.error("Lookup error:", error);
        res.status(500).json({ error: "Server error during prescription lookup." });
    }
};

module.exports = {
    validatePrescriptionData,
    checkPrescriptionExists
};
