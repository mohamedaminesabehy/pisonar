const bcrypt = require("bcrypt");
const Nurse = require("../models/Nurse");
const upload = require("../middlewares/multerConfig");

exports.createNurse = [
  upload.single("photo"), // Changed from `image` to `photo`
  async (req, res) => {
    try {
      // Check if all required fields exist
      const { fullName, email, dateOfBirth, gender, password, level  } = req.body;

      if (!fullName || !email || !dateOfBirth || !gender || !password || !level) {
        return res.status(400).json({ error: "All fields are required." });
      }

      // Check if the email is already taken
      const existingNurse = await Nurse.findOne({ email });
      if (existingNurse) {
        return res.status(400).json({ error: "Email is already registered." });
      }

      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new nurse object
      const nurse = new Nurse({
        fullName,
        email,
        dateOfBirth,
        gender,
        password: hashedPassword,
        level,
        skills: req.body.skills || [],
        about: req.body.about || "",
        languages: req.body.languages || [],
        address: req.body.address || "",
        photo: req.file ? `/uploads/${req.file.filename}` : null, // Consistent path with leading `/`
        addedBy: req.user ? req.user._id : null, // Set by authenticated admin
      });

      // Save to database
      const savedNurse = await nurse.save();
      res.status(201).json({ message: "Nurse added successfully", nurse: savedNurse });
    } catch (err) {
      console.error("Error creating nurse:", err);
      res.status(500).json({ error: "Server error" });
    }
  },
];

exports.getAllNurses = async (req, res) => {
  try {
    const nurses = await Nurse.find();
    res.status(200).json(nurses);
  } catch (err) {
    console.error("Error fetching nurses:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getNurseById = async (req, res) => {
  try {
    const nurse = await Nurse.findById(req.params.id);
    if (!nurse) return res.status(404).json({ error: "Nurse not found" });
    res.status(200).json(nurse);
  } catch (err) {
    console.error("Error fetching nurse:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateNurse = [
  upload.single("photo"), // Changed from `image` to `photo`
  async (req, res) => {
    try {
      const nurse = await Nurse.findById(req.params.id);
      if (!nurse) return res.status(404).json({ error: "Nurse not found" });

      // Update only the fields provided in the request
      Object.keys(req.body).forEach((key) => {
        if (key === "password") return; // Password updates not allowed here
        nurse[key] = req.body[key];
      });

      // Update photo if a new file is uploaded
      if (req.file) {
        nurse.photo = `/uploads/${req.file.filename}`; // Consistent path with leading `/`
      }

      await nurse.save();
      res.status(200).json({ message: "Nurse updated successfully", nurse });
    } catch (err) {
      console.error("Error updating nurse:", err);
      res.status(400).json({ error: "Invalid data provided." });
    }
  },
];

exports.deleteNurse = async (req, res) => {
  try {
    const nurse = await Nurse.findByIdAndDelete(req.params.id);
    if (!nurse) return res.status(404).json({ error: "Nurse not found" });

    res.status(200).json({ message: "Nurse deleted successfully" });
  } catch (err) {
    console.error("Error deleting nurse:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Export all methods explicitly
module.exports = {
  createNurse: exports.createNurse,
  getAllNurses: exports.getAllNurses,
  getNurseById: exports.getNurseById,
  updateNurse: exports.updateNurse,
  deleteNurse: exports.deleteNurse,
};