const express = require('express');
const router = express.Router();
const patientDataController = require('../controllers/patientdataController');



// Add this route before your other routes
router.get('/doctors/available', patientDataController.getAvailableDoctors);

// ... rest of your existing routes
// Create a new patient data
router.post('/', patientDataController.createPatientData);

// Get all patients data
router.get('/', patientDataController.getAllPatientsData);

// Get single patient data by ID
router.get('/:id', patientDataController.getPatientData);

// Get patient data by email
router.get('/email/:email', patientDataController.getPatientDataByEmail);

// Update patient data
router.put('/:id', patientDataController.updatePatientData);

// Delete patient data
router.delete('/:id', patientDataController.deletePatientData);

// Get all patients assigned to a specific doctor
router.get('/doctor/:doctorId', patientDataController.getPatientsByDoctor);







module.exports = router;