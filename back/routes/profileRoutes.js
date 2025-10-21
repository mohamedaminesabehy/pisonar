const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');
const Admin = require('../models/Admin');
const upload = require('../middlewares/multerConfig'); // Import Multer configuration

// Middleware to authenticate token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Récupérer le profil de l'utilisateur connecté
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let userProfile;
    switch (userRole) {
      case 'Patient':
        userProfile = await Patient.findById(userId);
        break;
      case 'Doctor':
        userProfile = await Doctor.findById(userId);
        break;
      case 'Nurse':
        userProfile = await Nurse.findById(userId);
        break;
      case 'Admin':
        userProfile = await Admin.findById(userId);
        break;
      default:
        return res.status(400).json({ message: 'Invalid user role' });
    }
    
    if (!userProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mettre à jour le profil de l'utilisateur connecté
router.put('/update', authenticate, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const updateData = { ...req.body };

    // Ne pas permettre la mise à jour du mot de passe via ce endpoint
    delete updateData.password;

    // Handle photo upload if a file is provided
    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`; // Save the relative path
    }

    // Convert comma-separated strings to arrays if provided
    if (updateData.skills) updateData.skills = updateData.skills.split(", ");
    if (updateData.languages) updateData.languages = updateData.languages.split(", ");
    if (updateData.medicalHistory) updateData.medicalHistory = updateData.medicalHistory.split(", ");

    let userProfile;
    switch (userRole) {
      case 'Patient':
        userProfile = await Patient.findByIdAndUpdate(userId, updateData, { new: true });
        break;
      case 'Doctor':
        userProfile = await Doctor.findByIdAndUpdate(userId, updateData, { new: true });
        break;
      case 'Nurse':
        // Rename nurseLevel to level to match the schema
        if (updateData.nurseLevel) {
          updateData.level = updateData.nurseLevel;
          delete updateData.nurseLevel;
        }
        userProfile = await Nurse.findByIdAndUpdate(userId, updateData, { new: true });
        break;
      case 'Admin':
        userProfile = await Admin.findByIdAndUpdate(userId, updateData, { new: true });
        break;
      default:
        return res.status(400).json({ message: 'Invalid user role' });
    }

    if (!userProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;