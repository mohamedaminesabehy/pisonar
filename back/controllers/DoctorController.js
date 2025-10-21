const bcrypt = require("bcrypt");
const Doctor = require("../models/Doctor");
const upload = require("../middlewares/multerConfig");

exports.createDoctor = [
  upload.single("photo"), // Changed from `image` to `photo`
  async (req, res) => {
    try {
      // Check if all required fields exist
      const { fullName, email, dateOfBirth, gender, password, specialization } = req.body;

      if (!fullName || !email || !dateOfBirth || !gender || !password || !specialization ) {
        return res.status(400).json({ error: "All fields are required." });
      }

      // Check if the email is already taken
      const existingDoctor = await Doctor.findOne({ email });
      if (existingDoctor) {
        return res.status(400).json({ error: "Email is already registered." });
      }

      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new doctor object
      const doctor = new Doctor({
        fullName,
        email,
        dateOfBirth,
        gender,
        password: hashedPassword,
        specialization,
        photo: req.file ? `/uploads/${req.file.filename}` : null, // Consistent path with leading `/`
        addedBy: req.user ? req.user._id : null, // Set by authenticated admin
      });

      // Save to database
      const savedDoctor = await doctor.save();
      res.status(201).json({ message: "Doctor added successfully", doctor: savedDoctor });
    } catch (err) {
      console.error("Error creating doctor:", err);
      res.status(500).json({ error: "Server error" });
    }
  },
];

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (err) {
    console.error("Error fetching doctor:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateDoctor = [
  upload.single("photo"), // Allow photo updates
  async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.params.id);
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });

      // Update only the fields provided in the request
      Object.keys(req.body).forEach((key) => {
        if (key === "password") return; // Password updates not allowed here
        doctor[key] = req.body[key];
      });

      // Update photo if a new file is uploaded
      if (req.file) {
        doctor.photo = `/uploads/${req.file.filename}`; // Consistent path with leading `/`
      }

      await doctor.save();
      res.status(200).json({ message: "Doctor updated successfully", doctor });
    } catch (err) {
      console.error("Error updating doctor:", err);
      res.status(400).json({ error: "Invalid data provided." });
    }
  },
];

exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (err) {
    console.error("Error deleting doctor:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Export all methods explicitly
module.exports = {
  createDoctor: exports.createDoctor,
  getAllDoctors: exports.getAllDoctors,
  getDoctorById: exports.getDoctorById,
  updateDoctor: exports.updateDoctor,
  deleteDoctor: exports.deleteDoctor,
};